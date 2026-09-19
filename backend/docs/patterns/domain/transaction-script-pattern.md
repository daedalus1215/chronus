---
tags: [architecture, domain-layer, ddd]
---

# Transaction Script Pattern

## Purpose

A **Transaction Script** encapsulates a single business transaction or use case. It is the primary unit of domain work — each script handles one well-defined operation end-to-end: fetching data, transforming it, persisting changes, and returning a result.

Transaction Scripts are the answer to: *"Where does the business logic for a specific use case live?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Implement a single business use case or transaction | **Transaction Script** |
| Orchestrate multiple transaction scripts | Domain Service |
| Coordinate cross-domain communication | Aggregator |
| Transform data between representations | Converter / Mapper |

Use a Transaction Script when:

- There is a **single, well-scoped use case** (e.g. fetch case detail, complete a file upload, delete a record)
- The logic can be expressed in a **single `apply()` method** with clear inputs and outputs
- You need an **independently testable** unit of business logic

---

## Key Characteristics

1. **Single responsibility** — handles one specific use case.
2. **Parameter objects for input** — uses typed `Params` objects, not loose primitives.
3. **Independently testable** — each script can be unit tested with mocked dependencies.
4. **Single `apply` method** — the public entry point for executing the script.
5. **Thin orchestration** — delegates transformation to Mappers/Assemblers/Converters; delegates data access to Repositories.

---

## Anatomy

### Basic Transaction Script

```typescript
@Injectable()
export class FetchCaseDetailTS {
  constructor(private readonly caseRepository: CaseRepository) {}

  async apply(id: number): Promise<CaseDetailProjection> {
    const caseEntity = await this.caseRepository.findById(id);
    return {
      caseID: caseEntity.id.toString(),
      caseShortName: caseEntity.shortName,
      caseFullName: caseEntity.fullName,
    };
  }
}
```

### Transaction Script with Mapper (Blackbox)

```typescript
@Injectable()
export class UploadCompleteRecordFileTS {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly createRecordFileMapper: CreateRecordFileMapper,
  ) {}

  async apply(params: UploadCompleteRecordFileParams): Promise<void> {
    const existingFile = await this.fileRepository.findByKey(params.key);
    const { file, fileAttachment, fileTag } =
      await this.createRecordFileMapper.apply(params, existingFile);
    await this.fileRepository.save(file);
  }
}
```

### Parameter Object

```typescript
// upload-complete-note-file.param.ts
export type UploadCompleteRecordFileParams = {
  filename: string;
  key: string;
  uploadId: string;
  bucket: string;
  userId: string;
};
```

---

## Hierarchy Position

Transaction Scripts sit below Domain Services and above Mappers:

```
Domain Services
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts    ← this level
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
| **Can inject** | Repositories, Mappers, Aggregators (via ports), Converters (only if not used by a Mapper/Assembler) |
| **Cannot inject** | Other Transaction Scripts, Domain Services, Assemblers (if used by a Mapper) |
| **Injected by** | Domain Services, Aggregators |
| **Same-level rule** | Transaction Scripts must not inject other Transaction Scripts |

### Why No Same-Level Injection?

When multiple Transaction Scripts need to work together, orchestration moves **up one level** to a Domain Service or Aggregator. This keeps each script focused on a single use case and prevents hidden coupling.

### Blackbox Principle

If a Converter is used by a Mapper, the Transaction Script should inject the Mapper — not the Converter directly. The Mapper is a blackbox that owns its internal dependencies.

**Exception:** If a Converter is NOT used by any Mapper/Assembler, the Transaction Script can inject it directly.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Action}{Entity}TS` | `FetchCaseDetailTS`, `UploadCompleteRecordFileTS` |
| File name | `{action-name}.transaction.script.ts` | `fetch-case-detail.transaction.script.ts` |
| Folder | `{transaction-name}-TS/` | `fetch-case-detail-TS/` |
| Param type | `{Action}{Entity}Params` | `UploadCompleteRecordFileParams` |
| Param file | `{action-name}.param.ts` | `upload-complete-note-file.param.ts` |
| Spec file | `{action-name}.transaction.script.spec.ts` in `__specs__/` | `fetch-case-detail.transaction.script.spec.ts` |

---

## Folder Structure

```
{module}/
└── domain/
    └── transaction-scripts/
        └── {transaction-name}-TS/
            ├── {transaction-name}.transaction.script.ts
            ├── {transaction-name}.param.ts
            ├── {mapper-name}/           ← colocated mapper (if any)
            │   └── ...
            ├── {assembler-name}/        ← colocated assembler (if any)
            │   └── ...
            └── __specs__/
                └── {transaction-name}.transaction.script.spec.ts
```

Lower-level patterns (Mappers, Assemblers, Converters) live **next to the Transaction Script that consumes them** — functional cohesion: things that change together, live together.

---

## Design Principles

- **Object-Oriented:** Follow SOLID principles — particularly Single Responsibility and Dependency Inversion.
- **Functional:** Prefer `const`, use `map`/`filter`/`reduce` over loops, avoid mutating variables. This opens the door to running work concurrently.
- **Structured:** Top-down hierarchy of patterns. Store classes as close to consumers as possible (functional cohesion). Things that change together, live together.

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Transaction Script injecting another Transaction Script | Same-level injection; creates hidden coupling | Use a Domain Service or Aggregator to orchestrate multiple scripts |
| Fat Transaction Script with inline transformation | Violates single responsibility; not reusable | Extract transformations into Mappers/Assemblers/Converters |
| Transaction Script injecting a Domain Service | Creates circular dependency risk | Services orchestrate scripts, not the other way around |
| Bypassing a Mapper to inject its Converter directly | Breaks the blackbox principle | Use the Mapper; let it own its internal Converter |
| Using loose primitives instead of Param types | Loses type safety; parameter order bugs | Define typed `Params` objects for inputs |
