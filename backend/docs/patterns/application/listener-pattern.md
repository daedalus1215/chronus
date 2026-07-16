---
tags: [architecture, application-layer, nestjs, eventing]
---

# Listener Pattern

## Purpose

A **Listener** is an entry point that receives **inbound domain events from a message queue** (SQS, SNS, Kafka, etc.). It sits at the same level as Actions and Webhooks: the application-layer boundary. Listeners contain no business logic — they parse the event payload, delegate to a Domain Service, and acknowledge the message.

Listeners are the answer to: *"How do we process events published by other services via a message queue?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| React to an inbound domain event from a message queue | **Listener** |
| Receive an HTTP request from the frontend | Action |
| Receive an inbound HTTP callback from another backend | Webhook |

Use a Listener when:

- The trigger is an **asynchronous event** delivered via a queue (not HTTP)
- The event was published by another service and Chronus is the **consumer**
- Processing must be **idempotent** — the same event may be delivered more than once

---

## Key Characteristics

1. **One class per event type** — each Listener handles a single event schema.
2. **Delegates to Domain Service** — Listeners parse and route; they do not decide.
3. **Idempotency** — Listeners should be safe to call multiple times with the same event; guard against duplicate processing in the Domain Service or Transaction Script.
4. **Acknowledges the message** — after successful processing, the Listener (or its framework wrapper) acknowledges the message so it is not redelivered.
5. **Same hierarchy position as Actions and Webhooks** — entry point only.

---

## Anatomy

### Listener Class

```typescript
// application/listeners/job-submitted/job-submitted.listener.ts
@Injectable()
export class JobSubmittedListener {
  constructor(private readonly jobService: JobService) {}

  async handle(event: InboundEvent<JobSubmittedPayload>): Promise<void> {
    await this.jobService.processJobSubmission({
      jobId: event.payload.jobId,
      submittedAt: event.payload.submittedAt,
    });
  }
}
```

### Inbox EventHandler (infrastructure wrapper)

Listeners are often wrapped by an **EventHandler** (see [[../infrastructure/messaging-pattern]]) that handles the claim–process–mark loop. The Listener itself stays focused on parsing and delegating.

```typescript
// infrastructure/event-handlers/job-submitted.event-handler.ts
@Injectable()
export class JobSubmittedEventHandler implements EventHandler {
  constructor(private readonly listener: JobSubmittedListener) {}

  async handle(event: InboundEvent): Promise<void> {
    await this.listener.handle(event);
  }
}
```

---

## Hierarchy Position

Listeners sit at the same level as Actions and Webhooks — the top of the application layer:

```
Actions        ← receive front-end requests
Webhooks       ← receive back-end requests
Listeners      ← receive event messages   (this pattern)
  ↓
Domain Services
  ↓
...
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Domain Services |
| **Cannot inject** | Transaction Scripts, Repositories, Aggregators, or any domain pattern below the Service level |
| **Injected by** | EventHandlers (infrastructure) — Listeners are entry points |

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{EventName}Listener` | `JobSubmittedListener` |
| File name | `{event-name}.listener.ts` | `job-submitted.listener.ts` |
| Folder | `application/listeners/{event-name}/` | |

---

## Idempotency

Listeners must be safe to call multiple times with the same event payload. Queues guarantee at-least-once delivery, so duplicate events are expected. Handle idempotency in the Domain Service or Transaction Script — not in the Listener itself.

Common strategies:
- Check if the entity has already been updated (and skip if so)
- Use a database unique constraint that silently ignores duplicate writes
- Store a processed-event log keyed by event ID

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Business logic in a Listener | Listeners are thin entry points | Delegate to a Domain Service |
| Listener injecting a Transaction Script directly | Skips the Service layer | Listeners inject Domain Services |
| Non-idempotent processing | At-least-once delivery means duplicates will arrive | Guard against duplicate processing at the Service or TS level |
| One Listener handling multiple event types | Violates single responsibility; routing logic leaks in | One class per event type |
