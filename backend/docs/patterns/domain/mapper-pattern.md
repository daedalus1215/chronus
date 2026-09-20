---
tags: [architecture, domain-layer, transformation]
---

# Mapper Pattern

## Purpose

A **Mapper** coordinates Assemblers, Converters, and Repositories to transform complex data structures. It is the highest-level transformation pattern — one layer above Assemblers — and typically handles multi-step transformation workflows.

Mappers are the answer to: *"Where does complex, multi-step data transformation live when it requires orchestrating several lower-level patterns?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Multi-step transformation orchestrating assemblers and converters | **Mapper** |
| Assembly requiring repository access alongside conversion | Assembler |
| Pure, stateless data transformation (no I/O) | Converter |

Use a Mapper when:

- The transformation has **multiple steps** that each warrant their own Assembler or Converter
- You need to **coordinate assemblers and converters** in a specific sequence
- The transformation is complex enough that a single Assembler would violate single responsibility

---

## Key Characteristics

1. **One layer above Assemblers** — coordinates multiple lower-level patterns.
2. **Handles complex transformation workflows** — multi-step pipelines with branching logic.
3. **Can inject Repositories** — for additional data needed during the mapping process.
4. **Single `apply` method** — consistent with other domain patterns.
5. **Typically one per Transaction Script** — a Mapper is used within a single TS context.

---

## Anatomy

### Mapper Orchestrating Assembler + Converter

```typescript
@Injectable()
export class CreateRecordFileMapper {
  constructor(
    private readonly createFileAttachmentAssembler: CreateFileAttachmentAssembler,
  ) {}

  async apply(
    params: UploadCompleteRecordFileParams & { bucket: string; userId: string },
    existingFile: File | null,
  ): Promise<{
    file: File;
    fileAttachment: FileAttachment;
    fileTag: FileTag;
  }> {
    const file = existingFile ?? new File();
    file.bucket = params.bucket;
    file.filePath = params.key;

    const { fileAttachment, fileTag } =
      await this.createFileAttachmentAssembler.apply(
        params.trackTypeId,
        params.noteId,
        params.isDeliverable,
      );

    file.fileAttachment = fileAttachment;
    return { file, fileAttachment, fileTag };
  }
}
```

---

## Hierarchy Position

Mappers sit between Transaction Scripts (above) and Assemblers (below):

```
Domain Services
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts
  ↓
Mappers    ← this level
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
| **Can inject** | Assemblers, Converters, Repositories |
| **Cannot inject** | Other Mappers, Transaction Scripts, Domain Services |
| **Injected by** | Transaction Scripts |
| **Same-level rule** | Mappers must not inject other Mappers |

### Blackbox Principle

When a Mapper uses an Assembler or Converter, the Transaction Script should use the **Mapper** — not reach through it to inject the Assembler or Converter directly. The Mapper is the blackbox.

### When Multiple Mappers Are Needed

If a Transaction Script needs multiple Mappers, consider whether the TS is doing too much. Restructuring into multiple Transaction Scripts (orchestrated by a Domain Service) is usually the better approach.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}Mapper` | `CreateRecordFileMapper`, `NoteFilesMapper` |
| File name | `{purpose}.mapper.ts` | `create-record-file.mapper.ts` |
| Folder | Colocated with the consuming Transaction Script | `{ts-name}-TS/` |
| Spec file | `{purpose}.mapper.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Mapper injecting another Mapper | Same-level injection violation | Restructure into multiple Transaction Scripts orchestrated by a Domain Service |
| Mapper containing business logic | Mappers transform data, not make decisions | Move business rules to a Transaction Script |
| Transaction Script bypassing a Mapper to inject its Assembler | Breaks the blackbox principle | Use the Mapper; let it own the Assembler internally |
| One giant Mapper doing everything | Violates single responsibility | Split into Mapper + Assemblers + Converters at appropriate levels |
