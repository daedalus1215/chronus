---
tags: [architecture, domain-layer, cross-domain]
---

# Aggregator Pattern

## Purpose

An **Aggregator** coordinates multiple Transaction Scripts and provides a unified interface for **cross-domain communication**. It is the mechanism through which one domain accesses the capabilities of another — always consumed via a port (interface + Symbol token).

Aggregators are the answer to: *"How does one domain access the Transaction Scripts of another domain without creating direct coupling?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Expose a domain's capabilities to other domains | **Aggregator** |
| Orchestrate multiple TS within the same domain from a Service | Domain Service |
| Implement a single use case | Transaction Script |

Use an Aggregator when:

- Another domain needs to **invoke Transaction Scripts** that belong to your domain
- You want to **hide internal domain complexity** behind a stable interface
- A Domain Service in domain A needs to trigger work in domain B

---

## Key Characteristics

1. **Cross-domain facade** — provides a unified interface to a domain's Transaction Scripts.
2. **Consumed via ports** — other domains inject the Aggregator through a `Symbol` token and a port type, not a concrete class.
3. **Coordinates Transaction Scripts** — delegates to one or more TS internally.
4. **No business logic** — Aggregators route calls, they do not make decisions.

---

## Anatomy

### Port Definition (in the consuming domain)

```typescript
// domain/ports/note-aggregator.port.ts
export const NOTE_AGGREGATOR = Symbol('NOTE_AGGREGATOR');

export type RecordAggregatorPort = {
  getRecordsByRecordIds(noteIds: number[]): Promise<Map<number, string>>;
  fetchFilesByRecordId(noteId: number): Promise<RecordFilesProjection>;
};
```

### Aggregator Implementation (in the providing domain)

```typescript
@Injectable()
export class RecordAggregator implements RecordAggregatorPort {
  constructor(
    private readonly fetchRecordsByRecordIdsTS: FetchRecordsByRecordIdsTS,
    private readonly fetchFilesByRecordIdTS: FetchFilesByRecordIdTS,
  ) {}

  async getRecordsByRecordIds(
    noteIds: number[],
  ): Promise<Map<number, string>> {
    return await this.fetchRecordsByRecordIdsTS.apply(noteIds);
  }

  async fetchFilesByRecordId(
    noteId: number,
  ): Promise<RecordFilesProjection> {
    return await this.fetchFilesByRecordIdTS.apply(noteId);
  }
}
```

### Consumption via Port Injection

```typescript
@Injectable()
export class JobSubmissionService {
  constructor(
    @Inject(NOTE_AGGREGATOR)
    private readonly noteAggregator: RecordAggregatorPort,
  ) {}

  async submitJob(formId: number): Promise<boolean> {
    const notes =
      await this.noteAggregator.getRecordsByRecordIds([1, 2, 3]);
    // ...
  }
}
```

### File Object Aggregator (Generic Subdomain)

```typescript
@Injectable()
export class FileObjectAggregator implements FileObjectAggregatorPort {
  constructor(
    private readonly startUploadTS: UploadStartTS,
    private readonly uploadPartTS: UploadPartTS,
    private readonly uploadCompleteTS: UploadCompleteTS,
    private readonly uploadAbortTS: UploadAbortTS,
    private readonly downloadFileTS: DownloadFileTS,
    private readonly deleteFileTS: DeleteFileTS,
  ) {}

  async uploadStart(params: UploadStartParams): Promise<string> {
    return await this.startUploadTS.apply(params);
  }

  async delete(params: DeleteParams): Promise<void> {
    await this.deleteFileTS.apply(params);
  }
}
```

---

## Hierarchy Position

Aggregators sit between Domain Services (above) and Transaction Scripts (below):

```
Domain Services
  ↓
Aggregators (via ports)    ← this level
  ↓
Transaction Scripts
  ↓
Mappers
  ↓
Assemblers
  ↓
Converters
  ↓
Repositories (shallow, data only)
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Transaction Scripts, Repositories (for simple lookups) |
| **Cannot inject** | Domain Services, other Aggregators |
| **Consumed via** | Port injection — `@Inject(SYMBOL_TOKEN)` with a port type |
| **Injected by** | Domain Services (in other domains) |
| **Same-level rule** | Aggregators must not inject other Aggregators |

### Cross-Domain Communication

For cross-domain Aggregator-to-Aggregator communication, use **ports**. Domain A's Aggregator should never directly import Domain B's Aggregator class. Instead, Domain A defines a port, Domain B implements it.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Domain}Aggregator` | `RecordAggregator`, `FileObjectAggregator` |
| File name | `{domain}.aggregator.ts` | `record.aggregator.ts` |
| Folder | `{module}/domain/aggregators/` | `src/notes/domain/aggregators/` |
| Port type | `{Domain}AggregatorPort` | `RecordAggregatorPort` |
| Token | `{DOMAIN}_AGGREGATOR` (Symbol) | `NOTE_AGGREGATOR` |
| Spec file | `{domain}.aggregator.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Aggregator injecting another Aggregator | Same-level injection; creates cross-domain coupling | Use ports for cross-domain Aggregator communication |
| Aggregator injecting a Domain Service | Dependency flows the wrong direction | Services consume Aggregators, not the other way |
| Direct import of Aggregator class across domains | Breaks domain boundary isolation | Define a port in the consuming domain; inject via `@Inject(TOKEN)` |
| Business logic in an Aggregator | Aggregators route calls, not make decisions | Move business logic to a Transaction Script |
| Aggregator without a port | Defeats the purpose of cross-domain isolation | Always define a port type + Symbol token |
