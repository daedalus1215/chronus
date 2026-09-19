---
tags: [architecture, domain-layer, transformation]
---

# Converter Pattern

## Purpose

A **Converter** transforms data between different representations — typically from an Entity to a Projection, or between two domain types. Converters are pure transformation logic with no business rules or data access.

Converters are the answer to: *"Where does stateless data transformation logic live?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Pure, stateless transformation between two data shapes | **Converter** |
| Transformation that requires repository access | Assembler |
| Orchestration of multiple converters and assemblers | Mapper |

Use a Converter when:

- The transformation is **pure** — no I/O, no repository calls, no side effects
- Input and output types are known at compile time
- The same transformation is needed in **multiple places** (or is complex enough to warrant its own class)

---

## Key Characteristics

1. **Pure transformation logic** — no side effects, no I/O.
2. **Stateless** — same input always produces the same output.
3. **Single `apply` method** — transforms one representation to another.
4. **No business logic** — Converters map data, they do not make business decisions.

---

## Anatomy

### Basic Converter

```typescript
@Injectable()
export class JobSubmissionFormConverter {
  toDto(entity: JobSubmissionForm): JobSubmissionFormProjection {
    return {
      id: entity.id,
      jobId: entity.jobId,
      jobStatusName: entity.jobStatus?.value,
    };
  }
}
```

---

## Hierarchy Position

Converters sit near the bottom of the domain hierarchy:

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
Converters    ← this level
  ↓
Repositories (shallow, data only)
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Comparators (pure ordering logic — does not break Converter purity) |
| **Cannot inject** | Other Converters, Repositories, Transaction Scripts, Domain Services, Assemblers, Mappers |
| **Injected by** | Assemblers, Mappers, Transaction Scripts (only if not used by a Mapper/Assembler — blackbox principle) |
| **Same-level rule** | Converters must not inject other Converters |

### Why Can Converters Inject Comparators?

Comparators are pure, stateless ordering logic with no I/O or dependencies of their own. Injecting one does not break Converter purity — both are deterministic value-in / value-out classes. The combination is effectively two pure functions composed together.

### Why No Repository Access?

If a transformation needs to look up additional data from the database, use an **Assembler** instead. Assemblers can inject both Converters and Repositories.

### Why No Other Converters?

Converters sit at the same hierarchical level and must not inject each other. If you need to compose multiple conversions, use an **Assembler** or **Mapper** to orchestrate them.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Source}To{Target}Converter` or `{Purpose}Converter` | `FileAttachmentToCaseFilesProjectionConverter` |
| File name | `{source}-to-{target}.converter.ts` or `{purpose}.converter.ts` | `file-attachment-to-case-files-projection.converter.ts` |
| Location | Within the transaction script folder that consumes it, or as high as the highest consumer | `{module}/domain/converters/` or `{module}/domain/transaction-scripts/{ts-name}-TS/` |
| Spec file | `{name}.converter.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Converter injecting a Repository | Converters are pure; data access breaks purity | Use an Assembler for transformations that need repository data |
| Converter injecting another Converter | Same-level injection violation | Use an Assembler or Mapper to compose multiple converters |
| Business logic inside a Converter | Converters map data, not make decisions | Move business rules to a Transaction Script |
| Transaction Script injecting a Converter that a Mapper already uses | Breaks the blackbox principle | Inject the Mapper; let it own the Converter internally |
