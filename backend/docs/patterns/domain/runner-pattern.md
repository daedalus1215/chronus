---
tags: [architecture, domain-layer, eventing, outbox]
---

# Runner Pattern

## Purpose

A **Runner** is a domain-layer entry point for **projection-driven outbox emission**. It implements the `OutboxProjectorRunnerPort` — a domain port — and teaches the generic `OutboxProjectorEngine` how to find and transform domain-specific changes into outbox event descriptors.

Runners are the answer to: *"How does the outbox projector know which rows to read and how to convert them for a specific entity, without coupling the engine to domain knowledge?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Entity is owned/updated by an external system (e.g. external sync service) — project its state into the outbox | **Runner** |
| Chronus is the writer of record for the entity — emit on the command path | Dispatcher (via port) |
| A Domain Service needs to orchestrate multiple use cases | Domain Service |

Use a Runner when:

- You are on the **projection-driven** outbox path (entity fed by external system, not created by Chronus)
- You need the generic `OutboxProjectorEngine` to know where to read from and how to shape each event
- Each **source entity / stream** gets its own Runner (one per entity type)

---

## Key Characteristics

1. **Domain entry point** — Runners are called by application-layer **Pollers**, which hand them to the `OutboxProjectorEngine`. They sit at the top of the domain layer, parallel to Domain Services.
2. **Implements a domain port** — `OutboxProjectorRunnerPort<TEntity, TEvent>` is defined in the generic domain; each Runner implements it for a specific entity type.
3. **Reads and transforms only** — no business decisions; the Runner fetches a batch of changed rows and assembles outbox descriptors.
4. **One per source entity / stream** — `JobsToOutboxRunner`, `CasesToOutboxRunner`, `ContactsToOutboxRunner`, etc.
5. **Co-located in `domain/runners/`** — part of the domain layer, not infrastructure.

---

## Anatomy

### Port (generic domain)

```typescript
// src/generic/outbox-projector/domain/ports/outbox-projector-runner.port.ts
export type OutboxProjectorRunnerPort<TEntity, TEvent> = {
  getNextBatch(cursor: RunnerCursor): Promise<OutboxDescriptor<TEvent>[]>;
};
```

### Runner Implementation

```typescript
// src/jobs/domain/runners/jobs-to-outbox/jobs-to-outbox.runner.ts
@Injectable()
export class JobsToOutboxRunner
  implements OutboxProjectorRunnerPort<Job, JobOutboxEvent>
{
  constructor(
    private readonly jobsProjectorRepository: JobsProjectorRepository,
    private readonly jobToOutboxDescriptorAssembler: JobToOutboxDescriptorAssembler,
  ) {}

  async getNextBatch(
    cursor: RunnerCursor,
  ): Promise<OutboxDescriptor<JobOutboxEvent>[]> {
    const jobs = await this.jobsProjectorRepository.fetchSince(cursor.lastId);
    return Promise.all(jobs.map((job) => this.jobToOutboxDescriptorAssembler.apply(job)));
  }
}
```

### Poller (application layer — calls the Runner)

```typescript
// src/jobs/application/pollers/jobs-to-outbox.poller.ts
@Injectable()
export class JobsToOutboxPoller {
  constructor(
    private readonly outboxProjectorEngine: OutboxProjectorEngine,
    private readonly jobsToOutboxRunner: JobsToOutboxRunner,
  ) {}

  async poll(): Promise<void> {
    await this.outboxProjectorEngine.run(this.jobsToOutboxRunner);
  }
}
```

---

## Hierarchy Position

Runners are a **domain entry point** — they sit at the top of the domain layer, parallel to Domain Services. Like Domain Services, they are called by the application layer; unlike Domain Services, they are called by Pollers rather than Actions/Webhooks/Listeners, and their allowed dependencies are scoped to Repositories and Assemblers.

```
Application Layer
  Actions / Webhooks / Listeners  ─────→  Domain Services
  Pollers                         ─────→  Runners          ← this pattern
                                               ↓
                                         Assemblers
                                               ↓
                                         Converters / Comparators
                                               ↓
                                         Repositories
```

Runners do **not** go through Transaction Scripts or Mappers. Their job is narrow: fetch a batch of raw rows, assemble outbox descriptors, return. Orchestration that requires Transaction Script complexity belongs on the command-driven path (Dispatcher) instead.

---

## Folder Structure

```
{module}/
└── domain/
    └── runners/
        └── {entity}-to-outbox/
            ├── {entity}-to-outbox.runner.ts
            └── assemblers/
                └── {entity}-to-outbox-descriptor.assembler.ts
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Repositories, Assemblers |
| **Cannot inject** | Transaction Scripts, Domain Services, Mappers, other Runners |
| **Implements** | `OutboxProjectorRunnerPort<TEntity, TEvent>` |
| **Called by** | Application-layer Pollers (via `OutboxProjectorEngine`) |
| **Same-level rule** | Runners must not inject other Runners |

### Why Not Transaction Scripts?

The Runner's scope is deliberate: read rows, assemble descriptors, done. If the transformation is complex enough to need Transaction Scripts, that's a signal to reconsider whether projection-driven emission is the right path — command-driven emission (Dispatcher) may fit better.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Entities}ToOutboxRunner` | `JobsToOutboxRunner`, `CasesToOutboxRunner` |
| File name | `{entities}-to-outbox.runner.ts` | `jobs-to-outbox.runner.ts` |
| Folder | `{module}/domain/runners/{entity}-to-outbox/` | `src/jobs/domain/runners/jobs-to-outbox/` |
| Port token | `OutboxProjectorRunnerPort` | (generic — no per-domain Symbol needed) |

---

## Command-Driven vs Projection-Driven

| | Command-driven (Dispatcher) | Projection-driven (Runner) |
| --- | --- | --- |
| **When** | Chronus creates / mutates the entity | External system owns the entity |
| **Entry point** | Transaction Script → Dispatcher port | Poller → Runner → OutboxProjectorEngine |
| **Emission trigger** | On the write path (transactional) | On a poll interval (eventual) |
| **Mixed sources** | — | Disable or scope the Runner; emit only one path to avoid duplicates |


Engine internals: See `infrastructure/messaging-pattern.md`.  
Side-by-side comparison with command-driven: [[../outbox-emission-flows]].

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Runner injecting a Transaction Script | Runners are narrow fetch-and-assemble; TS complexity signals the wrong emission path | If you need TS-level orchestration, use command-driven emission (Dispatcher) |
| Runner injecting another Runner | Same-level injection violation | Each Runner is independent per entity |
| Business decisions in a Runner | Runners fetch and transform — they do not make domain decisions | Move decisions to a Transaction Script on the command-driven path |
| Placing Runner in `infrastructure/` | Runners implement a domain port and own assembly logic | Runner lives in `{module}/domain/runners/` |
| One Runner for multiple entity types | Violates single responsibility; engine dispatching becomes complex | One Runner per source entity / stream |
