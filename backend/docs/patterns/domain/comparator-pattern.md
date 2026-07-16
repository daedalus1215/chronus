---
tags: [architecture, domain-layer, transformation]
---

# Comparator Pattern

## Purpose

A **Comparator** is a pure, stateless `@Injectable()` class that defines an ordering relationship between two values of the same type. It follows the Java `Comparator<T>` contract: a single `apply(a: T, b: T): number` method returning negative, zero, or positive.

Comparators are the answer to: *"Where does sorting logic live when the order cannot be expressed in SQL (or should be owned by the application layer)?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Define a reusable ordering/sorting strategy for domain values | **Comparator** |
| Transform data between representations | Converter |
| Combine converters and repositories to assemble complex objects | Assembler |
| High-level mapping that coordinates assemblers and converters | Mapper |

Use a Comparator when:

- The sort order is **non-trivial** and cannot be expressed cleanly in SQL (e.g. natural sort of filenames with mixed text and digits)
- Multiple Assemblers, Mappers, or Converters need the **same ordering logic**
- You want the sorting algorithm to be **unit-testable in isolation**, independent of data retrieval or transformation

---

## Key Characteristics

1. **Pure comparison logic** — no side effects, no dependencies, no I/O.
2. **Stateless and deterministic** — the same inputs always produce the same output.
3. **Single `apply` method** — `apply(a: T, b: T): number` returning negative (a < b), zero (a == b), or positive (a > b).
4. **`@Injectable()`** — registered with NestJS DI so it can be injected into Converters, Assemblers, and Mappers.
5. **No dependencies** — Comparators sit at the bottom of the dependency hierarchy and inject nothing.

---

## Anatomy

### Class Definition

```typescript
@Injectable()
export class NaturalFilenameComparator {
  apply(a: string, b: string): number {
    const chunksA = this.splitIntoChunks(a);
    const chunksB = this.splitIntoChunks(b);
    // Compare chunk-by-chunk: text chunks case-insensitive,
    // numeric chunks by parsed integer value
  }

  private splitIntoChunks(value: string): string[] {
    return value.match(/\d+|[^\d]+/g) ?? [];
  }
}
```

### Consumption in an Assembler

```typescript
@Injectable()
export class GroupAndSortCaseFilesAssembler {
  constructor(
    private readonly converter: ConvertFileAttachmentToCaseFilesProjection,
    private readonly naturalFilenameComparator: NaturalFilenameComparator,
  ) {}

  apply(
    fileAttachments: FileAttachment[],
    categories: FileCaseCategory[],
  ): CaseFilesProjection[] {
    const converted = fileAttachments
      .map((fa) => this.converter.apply(fa))
      .filter(Boolean);

    return categories.map((category) => ({
      ...category,
      files: converted
        .filter((f) => f.categoryId === category.id)
        .sort((a, b) =>
          this.naturalFilenameComparator.apply(a.fileName, b.fileName),
        ),
    }));
  }
}
```

### Consumption in a Mapper

```typescript
@Injectable()
export class NoteFilesMapper {
  constructor(
    private readonly assembler: FileAttachmentsToNoteFilesByTrackTypeAssembler,
    private readonly groupConverter: GroupNoteFilesByTrackTypeConverter,
    private readonly fillerConverter: AddFillerFilesIfTrackTypeIsEmptyConverter,
    private readonly naturalFilenameComparator: NaturalFilenameComparator,
  ) {}

  apply(fileAttachments: FileAttachment[], allTrackTypes: TrackType[]): NoteFilesProjection {
    const converted = await this.assembler.apply(fileAttachments);
    const grouped = this.groupConverter.apply(converted);

    const sorted = grouped.map((trackType) => ({
      ...trackType,
      files: [...trackType.files].sort((a, b) =>
        this.naturalFilenameComparator.apply(a.fileName, b.fileName),
      ),
    }));

    return {
      trackTypes: this.fillerConverter.apply(sorted, allTrackTypes),
      // ...
    };
  }
}
```

---

## Hierarchy Position

Comparators sit at the same level as Converters — near the bottom of the dependency hierarchy:

```
Domain Services
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts
  ↓
Mappers
  ↓
Assemblers
  ↓
Converters / Comparators    ← same level
  ↓
Repositories (shallow, data only)
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Nothing — Comparators are pure logic with no dependencies |
| **Cannot inject** | Other Comparators, Converters, Repositories, Transaction Scripts, Domain Services, Assemblers, Mappers |
| **Injected by** | Converters, Assemblers, Mappers |
| **Cannot be injected by** | Transaction Scripts, Domain Services, Repositories, Aggregators |
| **Same-level rule** | Comparators must not inject other Comparators |

### Why Transaction Scripts Cannot Inject Comparators Directly

The **blackbox principle** applies. If a Comparator is used by an Assembler or Mapper, the Transaction Script should use that Assembler/Mapper — not reach through it to inject the Comparator directly. If no Assembler/Mapper exists yet, that is a signal to introduce one.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}Comparator` | `NaturalFilenameComparator` |
| File name | `{purpose}.comparator.ts` | `natural-filename.comparator.ts` |
| Shared location | `src/shared/comparators/` | `src/shared/comparators/natural-filename.comparator.ts` |
| Domain-specific location | `{module}/domain/comparators/` | `src/cases/domain/comparators/case-priority.comparator.ts` |
| Spec file | `{purpose}.comparator.spec.ts` in `__specs__/` | `src/shared/comparators/__specs__/natural-filename.comparator.spec.ts` |

---

## Fitness Functions

Comparator constraints are enforced by dependency-cruiser rules in `fitness-functions-rules/architecture-rules/comparators.rules.ts`:

| Rule | From | Cannot depend on |
|---|---|---|
| `comparators-no-repositories` | `*.comparator.ts` | `repositories/*` |
| `comparators-no-other-comparators` | `*.comparator.ts` | `*.comparator.ts` |
| `comparators-no-transaction-scripts` | `*.comparator.ts` | `*.transaction.script.ts` |
| `comparators-no-services` | `*.comparator.ts` | `*.service.ts` |
| `comparators-no-mappers` | `*.comparator.ts` | `*.mapper.ts` |
| `comparators-no-assemblers` | `*.comparator.ts` | `*.assembler.ts` |
| `comparators-no-converters` | `*.comparator.ts` | `*.converter.ts` |

---

## Checklist for Adding a New Comparator

1. Determine if the comparator is **shared** (`src/shared/comparators/`) or **domain-specific** (`{module}/domain/comparators/`)
2. Create the class with a single `apply(a: T, b: T): number` method
3. Mark it `@Injectable()`
4. Write a spec covering edge cases — Comparators are pure functions, so they are straightforward to test exhaustively
5. Inject only into Converters, Assemblers, or Mappers — never into Transaction Scripts, Services, or Repositories directly
6. Register the Comparator in the module providers (or import a shared module that exports it)
7. If adding a SQL `ORDER BY` removal, confirm that the Assembler/Mapper now owns the sort (single source of truth)

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Sorting inline in a Transaction Script | Violates single responsibility; duplicates logic if multiple TS need the same order | Extract to a Comparator, inject into an Assembler/Mapper |
| Comparator injecting a Repository | Comparators are pure logic with no dependencies | If data is needed for comparison, the Assembler or Mapper should fetch it and pass values to the Comparator |
| Transaction Script injecting a Comparator directly | Breaks the blackbox principle when an Assembler/Mapper already uses that Comparator | Use the Assembler/Mapper; let it own the Comparator internally |
| Relying on SQL `ORDER BY` for non-trivial sort | Ties sorting to the database; not portable or unit-testable | Move sorting to a Comparator in the application layer; remove the SQL `ORDER BY` |
| One Comparator injecting another Comparator | Same-level injection violation | If you need a composite ordering, create a single Comparator that handles both concerns |
| Stateful Comparator (instance fields that change) | Breaks determinism and purity | Keep Comparators stateless; all inputs come through `apply()` arguments |

---

## Origin

Introduced to give reusable sorting logic a proper architectural home. The pattern was added to the pattern docs alongside updates to the dependency hierarchy, the DI summary table, and new fitness functions.
