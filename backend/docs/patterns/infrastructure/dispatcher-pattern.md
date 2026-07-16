---
tags: [architecture, infrastructure-layer, eventing]
---

# Dispatcher Pattern

## Purpose

A **Dispatcher** publishes domain events to external systems. It belongs in the **infrastructure layer** and implements a **port** defined in the domain layer — keeping the domain unaware of the messaging infrastructure (SQS, SNS, Kafka, etc.).

Dispatchers are the answer to: *"How do we publish events to external consumers without coupling the domain to messaging infrastructure?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Publish domain events after a unit of work | **Dispatcher** |
| Send commands to an external service | RemoteCaller |
| Wrap a unit of work in ambient infrastructure context | Hook |

Use a Dispatcher when:

- A domain operation needs to **notify external systems** (e.g. file uploaded, job submitted)
- The event payload requires **assembly** from multiple data sources
- You want the domain to declare the capability as a port without knowing the transport

---

## Key Characteristics

1. **Infrastructure layer** — Dispatchers live in `infrastructure/dispatchers/`, not in the domain.
2. **Implements a domain port** — the domain defines a port type + Symbol token; the Dispatcher implements it.
3. **Assembles and publishes** — may inject Assemblers to build event payloads before publishing.
4. **No business logic** — Dispatchers format and send events, they do not make business decisions.

---

## Anatomy

### Port Definition (domain layer)

```typescript
// domain/ports/record-file-upload.dispatcher.port.ts
export const RECORD_FILE_UPLOAD_DISPATCHER = Symbol(
  'RECORD_FILE_UPLOAD_DISPATCHER',
);

export type RecordFileUploadDispatcherPort = {
  apply(file: RecordFile, user: AuthUser, baseUrl: string): Promise<void>;
};
```

### Dispatcher Implementation (infrastructure layer)

```typescript
// infrastructure/dispatchers/record-file-upload/record-file-upload.dispatcher.ts
@Injectable()
export class RecordFileUploadDispatcher
  implements RecordFileUploadDispatcherPort
{
  constructor(
    private readonly assembler: RecordFileUploadAssembler,
    private readonly eventProducer: EventProducer,
  ) {}

  async apply(
    file: RecordFile,
    user: AuthUser,
    baseUrl: string,
  ): Promise<void> {
    const assembledDto =
      await this.assembler.assembleSubmissions({
        file,
        user,
        baseUrl,
      });
    await this.eventProducer.publish(assembledDto);
  }
}
```

### Consumption via Port (domain layer)

```typescript
@Injectable()
export class RecordFileService {
  constructor(
    @Inject(RECORD_FILE_UPLOAD_DISPATCHER)
    private readonly dispatcher: RecordFileUploadDispatcherPort,
  ) {}

  async uploadComplete(params: UploadCompleteCommand): Promise<void> {
    // ... business logic ...
    await this.dispatcher.apply(file, user, baseUrl);
  }
}
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Repositories, Assemblers |
| **Cannot inject** | Transaction Scripts, Domain Services, other Dispatchers |
| **Consumed via** | Port injection — `@Inject(SYMBOL_TOKEN)` with a port type |
| **Same-level rule** | Dispatchers must not inject other Dispatchers |

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}Dispatcher` | `RecordFileUploadDispatcher` |
| File name | `{purpose}.dispatcher.ts` | `record-file-upload.dispatcher.ts` |
| Folder | `{module}/infrastructure/dispatchers/{dispatcher-name}/` | |
| Port type | `{Purpose}DispatcherPort` | `RecordFileUploadDispatcherPort` |
| Token | `{PURPOSE}_DISPATCHER` (Symbol) | `RECORD_FILE_UPLOAD_DISPATCHER` |

---

## Emission Patterns

Dispatchers can follow two emission strategies:

| Strategy | When | Example |
| -------- | ---- | ------- |
| **Command-driven** | Chronus is the writer of record for the entity | File uploaded, note created, audio generated |
| **Projection-driven** | Entity is fed by an external system | external data sync, external data feed |

For command-driven emission, the Dispatcher is invoked from the Transaction Script or Service path via the port. For projection-driven emission, use the `OutboxProjectorEngine` with a domain-specific **Runner**.

Full flow diagrams for both paths: [[../outbox-emission-flows]].

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Dispatcher in the domain layer | Dispatchers are infrastructure; domain should not know transport details | Place in `infrastructure/dispatchers/`; define port in domain |
| Dispatcher injecting a Transaction Script | Dependency flows the wrong direction | Transaction Scripts (via Services) invoke Dispatchers through ports |
| Business logic in a Dispatcher | Dispatchers format and send events, not make decisions | Move business logic to a Transaction Script |
| Dispatcher without a port | Couples the domain directly to infrastructure | Always define a port type + Symbol token |
| One Dispatcher injecting another | Same-level injection violation | Separate event publications into independent Dispatchers |
