---
tags: [architecture, domain-layer, transformation]
---

# Assembler Pattern

## Purpose

An **Assembler** combines multiple Converters and Repositories to assemble complex objects. It bridges the gap between pure transformation (Converters) and data access (Repositories) — handling assembly that requires looking up additional data.

Assemblers are the answer to: *"Where does object construction live when it needs both transformation logic and repository access?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Assembly that requires repository access alongside conversion | **Assembler** |
| Pure, stateless data transformation (no I/O) | Converter |
| High-level orchestration of multiple assemblers and converters | Mapper |

Use an Assembler when:

- Building an object requires **fetching additional data** from a Repository
- You need to **compose a Converter with a repository lookup** in the same operation
- The logic is not business-decision-making — it is purely constructing/assembling an object from multiple sources

---

## Key Characteristics

1. **Orchestrates Converters and Repositories** — the minimal combination needed to assemble a complex object.
2. **No business logic** — Assemblers construct data, they do not make business decisions.
3. **Repository access is shallow** — only for data retrieval, not for business-rule queries.
4. **Single `apply` method** — consistent with other domain patterns.

---

## Anatomy

### Assembler with Converter + Repository

```typescript
@Injectable()
export class CreateFileAttachmentAssembler {
  constructor(
    private readonly trackTypeRepo: FileRecordTrackTypeRepository,
    private readonly fileAttachmentRepository: FileAttachmentRepository,
    private readonly fileTagRepository: FileTagRepository,
  ) {}

  async apply(
    fileTrackTypeId: number,
    jobId: number,
    isDeliverable: boolean,
  ): Promise<{ fileAttachment: FileAttachment; fileTag: FileTag }> {
    const fileAttachment = new FileAttachment();
    fileAttachment.trackTypeId = fileTrackTypeId;
    fileAttachment.attachedToId = jobId;
    fileAttachment.trackType =
      await this.trackTypeRepo.findById(fileTrackTypeId);
    const savedFileAttachment =
      await this.fileAttachmentRepository.create(fileAttachment);
    const fileTag = await this.fileTagRepository.findByValue(
      isDeliverable
        ? FILE_TAGS.CLIENT_DELIVERABLE
        : FILE_TAGS.SUBMISSION_FILE,
    );
    return { fileAttachment: savedFileAttachment, fileTag };
  }
}
```

---

## Hierarchy Position

Assemblers sit between Mappers (above) and Converters (below):

```
Domain Services
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts
  ↓
Mappers
  ↓
Assemblers    ← this level
  ↓
Converters
  ↓
Repositories (shallow, data only)
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Converters, Repositories (shallow — data retrieval only) |
| **Cannot inject** | Other Assemblers, Transaction Scripts, Domain Services, Mappers |
| **Injected by** | Mappers, Transaction Scripts (when no Mapper wraps the Assembler — blackbox principle) |
| **Same-level rule** | Assemblers must not inject other Assemblers |

### When Multiple Assemblers Need Orchestration

If you need to coordinate multiple Assemblers, use a **Mapper** one level up. The Mapper becomes the blackbox that owns both Assemblers.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}Assembler` | `CreateFileAttachmentAssembler`, `GroupAndSortCaseFilesAssembler` |
| File name | `{purpose}.assembler.ts` | `create-file-attachment.assembler.ts` |
| Folder | Colocated with the consuming Transaction Script | `{ts-name}/{assembler-name}/` |
| Spec file | `{purpose}.assembler.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Assembler injecting another Assembler | Same-level injection violation | Use a Mapper to orchestrate multiple Assemblers |
| Assembler containing business logic | Assemblers construct objects, not make decisions | Move business rules to a Transaction Script |
| Assembler injecting a Transaction Script | Dependency flows the wrong direction | Transaction Scripts consume Assemblers, not the other way |
| Deep repository queries in an Assembler | Repositories in Assemblers should be shallow data retrieval | Keep queries simple; complex lookups belong in Repositories with dedicated methods |
