---
tags: [architecture, domain-layer, ddd]
---

# Domain Service Pattern

## Purpose

A **Domain Service** orchestrates business logic by coordinating between Transaction Scripts and Aggregators. It is the highest-level domain component — the entry point called by Actions, Webhooks, and Listeners.

Domain Services are the answer to: *"Where do I orchestrate multiple Transaction Scripts or coordinate cross-domain work?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Orchestrate multiple transaction scripts or aggregators | **Domain Service** |
| Implement a single business use case | Transaction Script |
| Coordinate cross-domain communication | Aggregator |

Use a Domain Service when:

- A use case requires **coordinating multiple Transaction Scripts** in sequence
- You need to **invoke an Aggregator** to reach into another domain
- The Action/Controller needs a **single entry point** for a complex workflow

---

## Key Characteristics

1. **Orchestration, not implementation** — Services coordinate Transaction Scripts and Aggregators; they do not contain business logic themselves.
2. **Single domain entry point** — each Service is the primary interface for its module's use cases.
3. **Cross-domain via ports** — uses `@Inject()` with Symbol tokens to consume Aggregators from other domains.
4. **One per module** — typically one Service per main domain module.

---

## Anatomy

### Basic Domain Service

```typescript
@Injectable()
export class CaseService {
  constructor(
    private readonly fetchCaseDetailTS: FetchCaseDetailTS,
    @Inject(FILE_OBJECT_AGGREGATOR)
    private readonly fileObjectAggregator: FileObjectAggregatorPort,
    private readonly caseRepository: CaseRepository,
  ) {}

  async getCaseById(id: number): Promise<CaseDetailProjection> {
    return this.fetchCaseDetailTS.apply(id);
  }

  async deleteFile(fileId: FileId): Promise<void> {
    const file = await this.caseRepository.findFileById(fileId);
    if (!file) {
      throw new FileNotFoundException(`File with ID ${fileId} not found`);
    }
    await this.fileObjectAggregator.delete({
      bucket: file.bucket,
      key: file.filePath,
    });
    await this.deleteFileTS.apply({ fileId });
  }
}
```

### Service Consuming an Aggregator via Port

```typescript
@Injectable()
export class JobSubmissionService {
  constructor(
    @Inject(NOTE_AGGREGATOR)
    private readonly noteAggregator: RecordAggregatorPort,
    private readonly submitJobTS: SubmitJobTS,
  ) {}

  async submitJob(formId: number): Promise<boolean> {
    const notes =
      await this.noteAggregator.getRecordsByRecordIds([1, 2, 3]);
    return this.submitJobTS.apply({ formId, notes });
  }
}
```

---

## Hierarchy Position

Domain Services sit at the top of the domain layer:

```
Domain Services    ← this level
  ↓
Aggregators (via ports)
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
| **Can inject** | Transaction Scripts, Aggregators (via ports), Repositories (for simple lookups) |
| **Cannot inject** | Other Domain Services, Mappers, Assemblers, Converters |
| **Injected by** | Actions, Webhooks, Listeners (application layer) |
| **Same-level rule** | Domain Services must not inject other Domain Services |

### Why No Same-Level Injection?

If two Domain Services need to share work, use an **Aggregator** with a **port** for cross-domain communication. Direct Service-to-Service injection creates tight coupling and circular dependency risk.

### Why No Mappers/Assemblers/Converters?

Services orchestrate at a high level. Transformation logic belongs inside Transaction Scripts, which delegate to Mappers/Assemblers/Converters. The Service should not know about these lower-level details.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Module}Service` | `CaseService`, `FilesService` |
| File name | `{module-name}.service.ts` | `case.service.ts` |
| Folder | `{module}/domain/services/` | `src/cases/domain/services/` |
| Command type | `{Action}{Entity}Command` | `UploadStartRecordFileCommand` |
| Command file | `{action}.command.ts` | `upload-start-note-file.command.ts` |

### Commands

Services accept **Commands** as input — plain TypeScript types (no decorators) representing intent to change state:

```typescript
export type UploadStartRecordFileCommand = {
  noteId: number;
  jobId: number;
  trackTypeId: number;
  filename: string;
  size: number;
  isDeliverable: boolean;
  userId: string;
};
```

Commands live next to the Service: `{module}/domain/services/{service-name}/{action}.command.ts`

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Service injecting another Service | Same-level injection; creates tight coupling | Use Aggregator + port for cross-domain communication |
| Service containing business logic directly | Violates "orchestrate, don't implement" | Extract logic into a Transaction Script |
| Service injecting Mappers/Assemblers/Converters | Skips the Transaction Script layer | Let Transaction Scripts own transformation via their internal dependencies |
| Service using DTOs instead of Commands | Leaks application layer into domain | Define Commands as plain types in the domain layer |
