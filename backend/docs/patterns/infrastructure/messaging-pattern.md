---
tags: [architecture, infrastructure-layer, eventing, messaging]
---

# Messaging Patterns

## Purpose

The Chronus messaging layer handles **outbound domain events** (outbox) and **inbound external events** (inbox) through a set of named roles. Each role has a distinct responsibility — the key rule is: **do not conflate Runner with EventHandler**.

This page names and defines the four infrastructure roles that appear in messaging code. For the decision between command-driven and projection-driven outbox emission, see [[../domain/dispatcher-pattern]].

---

## The Four Roles

| Role | Layer | One per | Purpose |
| ---- | ----- | ------- | ------- |
| **Runner** | **Domain** | Source entity / stream | Reads changed rows via a checkpoint cursor; assembles outbox descriptors — see [[../domain/runner-pattern]] |
| **EventHandler** | Infrastructure | Event type | Processes a single inbound event type |
| **BatchProcessor** | Infrastructure | Operation | Claim–process–mark loop for inbox or outbox rows |
| **Facade** | Infrastructure | Module | Single entry point for writing inbox or outbox rows |

> **Runner lives in the domain layer**, not here. It is a domain entry point (called by application-layer Pollers) that implements `OutboxProjectorRunnerPort`. Full documentation: [[../domain/runner-pattern]].

---

## EventHandler

An EventHandler is an **inbox plugin** — it processes one inbound event type. The `OutboxProjectorEngine` (or equivalent inbox router) dispatches to the matching EventHandler based on event type.

**Use when:** Chronus needs to react to an event published by an external system.

**One EventHandler per event type** — do not handle multiple event types in one class.

```typescript
@Injectable()
export class JobCreatedEventHandler implements EventHandler {
  constructor(private readonly jobRepository: JobRepository) {}

  async handle(event: InboundEvent<JobCreatedPayload>): Promise<void> {
    await this.jobRepository.upsert(event.payload);
  }
}
```

**Naming convention:** `{EventName}EventHandler` / `{event-name}.event-handler.ts`

---

## BatchProcessor

A BatchProcessor implements the **claim–process–mark loop** for either inbox or outbox rows. It:

1. **Claims** a batch of unprocessed rows (marks them in-flight to prevent double-processing)
2. **Processes** each row (delegates to Runner or EventHandler)
3. **Marks** each row as completed or failed

BatchProcessors are framework-level plumbing, not domain logic. They are typically provided by the shared infrastructure module — domain code rarely implements one directly.

**Naming convention:** `{Purpose}BatchProcessor` / `{purpose}.batch-processor.ts`

---

## Facade

A Facade is the **single entry point** for writing inbox or outbox rows. It hides the details of row construction and persistence behind one method, so producers never build row objects directly.

```typescript
@Injectable()
export class OutboxFacade {
  constructor(private readonly outboxRepository: OutboxRepository) {}

  async write(descriptor: OutboxDescriptor): Promise<void> {
    const row = OutboxRow.from(descriptor);
    await this.outboxRepository.insert(row);
  }
}
```

**Naming convention:** `{Direction}Facade` e.g. `OutboxFacade`, `InboxFacade` / `{direction}.facade.ts`

---

## Emission Strategy Decision

| Scenario | Use |
| -------- | --- |
| Chronus is the **writer of record** for the entity (e.g. note created, video conversion requested) | **Command-driven** — emit from the transaction/command path via a Dispatcher port |
| Entity is **fed by an external system** (e.g. external data sync) | **Projection-driven** — `OutboxProjectorEngine` + a Runner that reads from a source repository with a checkpoint cursor |
| Mixed sources for one entity | Emit only one path; scope or disable the Runner to avoid duplicate events |

Full flows, pattern map, and diagrams: See `infrastructure/messaging-pattern.md`.  


---

## Dependency Rules

| Role | Can inject | Cannot inject |
| ---- | ---------- | ------------- |
| **EventHandler** | Transaction Scripts, Repositories | Domain Services, other EventHandlers |
| **BatchProcessor** | Runners, EventHandlers, Repositories | Domain Services |
| **Facade** | Repositories | Transaction Scripts, Domain Services |

Runner dependency rules: [[../domain/runner-pattern]].

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Using a Runner to handle inbound events | Runners are outbox projectors; they read and emit — not respond | Use an EventHandler for inbound event processing |
| Using an EventHandler to project outbound events | EventHandlers are inbox plugins; they react — not emit | Use a Runner + OutboxProjectorEngine |
| Business logic in a Runner or EventHandler | These are infrastructure routing roles | Delegate to Transaction Scripts (EventHandlers) or keep mapping simple (Runners) |
| One EventHandler handling multiple event types | Violates single responsibility; routing logic leaks in | One class per event type |
