---
tags: [architecture, eventing, outbox]
author: Larry Adams
created: 2026-07-03
modified: 2026-07-03
---

# Outbox Emission Flows

Two independent paths for publishing domain events from Chronus to external systems. The deciding factor is a single question of ownership: **does Chronus write the entity, or does an external system feed it?**

| | Command-Driven | Projection-Driven |
| --- | --- | --- |
| **Use when** | Chronus is the writer of record — the entity is created or mutated by a Chronus transaction | An external system (e.g. external sync service) owns the entity and feeds rows into Chronus's database |
| **Examples** | Note created, file uploaded | External data sync, third-party feed |


Engine internals and flow diagrams: See `infrastructure/messaging-pattern.md`

---

## Command-Driven Flow

Events emit **synchronously on the write path**, directly to Amazon SQS.

```
┌─ APPLICATION ───────────────────────────────────────────┐
│  Domain Service                                         │
│  job-submission.service.ts                              │
│  Orchestrates Transaction Scripts. After the primary    │
│  use case completes, invokes the Dispatcher port when   │
│  submission status is DONE.                             │
└─────────────────────────────┬───────────────────────────┘
                              │ @Inject(JOB_SUBMISSION_DISPATCHER)
┌─ DOMAIN ────────────────────▼───────────────────────────┐
│  Dispatcher Port                                        │
│  job-submission-form-submitted.dispatcher.port.ts       │
│  Symbol token + plain TypeScript type. The domain       │
│  declares capability without knowing the transport.     │
└─────────────────────────────┬───────────────────────────┘
                              │ implements port
┌─ INFRASTRUCTURE ────────────▼───────────────────────────┐
│  JobSubmissionFormSubmittedDispatcher                   │
│  infrastructure/dispatchers/job-submission-dispatcher/  │
│  Holds the SQS producer and the event assembler.        │
│  Calls assembleSubmissions(), then producer.apply().    │
│                             │                           │
│                             │ assembleSubmissions()      │
│                             ▼                           │
│  JobSubmissionFormSubmittedEventAssembler               │
│  infrastructure/dispatchers/.../event-assembler/        │
│  Builds the typed event envelope. Generates a unique    │
│  trace ID via uuidv4(). Extracts user identity, files,  │
│  and job details.                                       │
│                             │                           │
│                             │ producer.apply(SQS_URL)   │
│                             ▼                           │
│  SQSProducer                                            │
│  shared/producers/sqs/sqs.producer.ts                   │
│  Implements ProducerInterface<SQSMessageParams>.        │
│  Calls sqsService.send() with trace context.            │
└─────────────────────────────┬───────────────────────────┘
                              │ direct publish
┌─ EXTERNAL ──────────────────▼───────────────────────────┐
│  Amazon SQS                                             │
│  Event delivered immediately. uuidv4 trace ID is also   │
│  the SQS MessageDeduplicationId. No staging table.      │
└─────────────────────────────────────────────────────────┘
```

### Key facts

- **Timing:** synchronous — emission happens as part of the command transaction
- **Transport:** direct to Amazon SQS
- **Event ID:** `uuidv4()` — unique, random per emission
- **Idempotency:** SQS `MessageDeduplicationId`
- **Staging:** none
- **Concurrency guard:** none needed

### Pattern pages

- [[infrastructure/dispatcher-pattern]] — Dispatcher port definition and implementation rules
- [[domain/domain-service-pattern]] — where the Dispatcher is invoked from

---

## Projection-Driven Flow

Events are **staged asynchronously** — a Poller reads changed rows on an interval and writes event descriptors to the outbox table. A separate relay loop publishes them to RabbitMQ.

```
┌─ APPLICATION ───────────────────────────────────────────┐
│  JobsToOutboxPoller                                     │
│  application/pollers/jobs-to-outbox.poller.ts           │
│  Implements OnModuleInit. Starts a setInterval loop.    │
│  Acquires an advisory lock per cycle to prevent         │
│  concurrent execution across multiple instances.        │
└─────────────────────────────┬───────────────────────────┘
                              │ engine.run(runner, params)
┌─ DOMAIN ────────────────────▼───────────────────────────┐
│  OutboxProjectorEngine                                  │
│  generic/outbox-projector/domain/outbox-projector.engine│
│  Loads the checkpoint cursor. Calls runner.getNextBatch │
│  Checks existsById() for each row (idempotency).        │
│  Writes new descriptors via OutboxFacade. Upserts       │
│  the checkpoint cursor after each batch.                │
│                             │                           │
│                             │ getNextBatch(cursor)       │
│                             ▼                           │
│  JobsToOutboxRunner                                     │
│  domain/runners/jobs-to-outbox/jobs-to-outbox.runner.ts │
│  Implements OutboxProjectorRunnerPort<Job,JobOutboxEvent>│
│  Queries the projector repository for changed rows      │
│  since last cursor. Passes each row to the assembler.   │
│                             │                           │
│                             │ assembler.apply(row)       │
│                             ▼                           │
│  JobToOutboxDescriptorAssembler                         │
│  domain/runners/jobs-to-outbox/assemblers/              │
│  Determines event type (created vs updated). Selects    │
│  the matching contract from event-contracts.   │
│  Returns a typed OutboxEventDescriptor with schemaUri,  │
│  schemaVersion, aggregateType, and aggregateId.         │
└─────────────────────────────┬───────────────────────────┘
                              │ outboxFacade.writeOutboxEvent()
┌─ INFRASTRUCTURE ────────────▼───────────────────────────┐
│  OutboxFacade                                           │
│  outbox-relay package                         │
│  existsById() — idempotency check using uuidv5 event ID │
│  writeOutboxEvent() — persists the descriptor row       │
│                             │                           │
│                             │ INSERT INTO outbox_events  │
│                             ▼                           │
│  outbox_events table (PostgreSQL)                       │
│  Rows sit here until the relay poller claims them.      │
│  Each row carries the full payload, attempt count,      │
│  status, and the deterministic uuidv5 event ID.         │
└──────── separate relay process — own polling loop ──────┘
                              │ BatchProcessor claim–process–mark
┌─ APPLICATION ───────────────▼───────────────────────────┐
│  OutboxRelayPoller + OutboxBatchProcessor               │
│  generic/outbox-relay/outbox-relay.poller.ts            │
│  A second independent poller claims a batch of staged   │
│  rows, publishes each to RabbitMQ, then marks them      │
│  processed. Claim-before-publish prevents double        │
│  delivery under concurrent relay instances.             │
└─────────────────────────────┬───────────────────────────┘
                              │ publish to broker
┌─ EXTERNAL ──────────────────▼───────────────────────────┐
│  RabbitMQ                                               │
│  At-least-once delivery. Downstream consumers subscribe │
│  through the VHost boundary.     │
│  outbox-only phase — no inbox listeners yet.            │
└─────────────────────────────────────────────────────────┘
```

### Key facts

- **Timing:** asynchronous — rows staged first, relayed on the next relay cycle
- **Transport:** PostgreSQL outbox table → RabbitMQ
- **Event ID:** `uuidv5(runnerName|aggregateType|aggregateId|rowUpdatedAt|eventType)` — deterministic, derived from content
- **Idempotency:** deterministic ID prevents duplicate rows at the database level
- **Checkpoint:** `projector_checkpoints` table — `lastUpdatedAt` + `lastTieBreakerId` cursor
- **Concurrency guard:** advisory lock per runner, per poll cycle

### Process boundary

The projection-driven flow crosses a **process boundary** between the two pollers. The first poller (OutboxProjectorEngine + Runner) only writes to the outbox table. The second (OutboxRelayPoller + BatchProcessor) only reads from it and publishes to RabbitMQ. They are independent loops that do not share a transaction.

### Pattern pages

- [[domain/runner-pattern]] — Runner: domain entry point, what it can inject, one per entity
- [[infrastructure/messaging-pattern]] — EventHandler, BatchProcessor, Facade roles
- [[infrastructure/dispatcher-pattern]] — contrast with command-driven emission

---

## Side-by-side comparison

| | Command-Driven | Projection-Driven |
| --- | --- | --- |
| **Entity ownership** | Chronus creates and writes the entity | External system owns and feeds the entity |
| **When it fires** | Immediately, on the write path | On the next poll cycle after the row changes |
| **Message broker** | Amazon SQS (direct) | RabbitMQ (via outbox relay) |
| **Staging** | None | `outbox_events` table (PostgreSQL) |
| **Event ID** | `uuidv4()` — unique, random | `uuidv5(…)` — deterministic from row content |
| **Idempotency** | SQS `MessageDeduplicationId` | Deterministic ID — duplicate rows rejected at DB level |
| **Concurrency** | None needed | Advisory lock per runner, per poll cycle |
| **Checkpoint** | None | `projector_checkpoints` — `lastUpdatedAt` + `lastTieBreakerId` |
| **Domain entry** | Domain Service → Dispatcher Port | Poller → OutboxProjectorEngine → Runner |

---

## Mixed sources

If an entity has **both** a command-driven and a projection-driven path, emit only one. Disable or scope the Runner to avoid duplicate events reaching consumers. The ADR documents the cutover rules.

---

## Related

- [[dependency-hierarchy]] — where Dispatcher, Runner, and Poller sit in the layer hierarchy
- [[domain/runner-pattern]] — full Runner pattern documentation
- [[infrastructure/dispatcher-pattern]] — full Dispatcher pattern documentation
- [[infrastructure/messaging-pattern]] — Runner, EventHandler, BatchProcessor, Facade naming
