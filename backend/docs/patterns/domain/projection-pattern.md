---
tags: [architecture, domain-layer, ddd]
---

# Projection Pattern

## Purpose

A **Projection** defines a read-only data structure returned from domain components (Transaction Scripts, Converters, Assemblers) as their output contract. Projections are plain TypeScript types — no classes, no decorators, no framework coupling.

Projections are the answer to: *"What is the domain layer's output type, decoupled from API contracts and persistence?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Define the output shape from a Transaction Script or domain component | **Projection** |
| Define an API request/response contract with validation and Swagger decorators | DTO |
| Map a database table | Entity |

Use a Projection when:

- A Transaction Script, Converter, or Assembler needs a **typed return value**
- You want the domain layer to remain **framework-agnostic** (no `@ApiProperty()`, no `@IsString()`)
- The output shape may differ from both the Entity and the API response DTO

---

## Key Characteristics

1. **Plain TypeScript types** — not classes, no decorators.
2. **Framework-agnostic** — no Swagger, no class-validator, no TypeORM decorators.
3. **Domain output contract** — defines what the domain layer produces.
4. **Structurally compatible with DTOs** — often the same shape, allowing Actions to return projections directly when no mapping is needed.

---

## Anatomy

### Basic Projection

```typescript
// note-files.projection.ts
export type RecordFileProjection = {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  updatedAt: string;
  fileTags: string[];
};

export type RecordFilesProjection = {
  trackTypes: RecordFilesByTrackTypeProjection[];
  trackTypeCounts: TrackTypeCountProjection[];
};
```

### Usage in a Transaction Script

```typescript
@Injectable()
export class FetchFilesByRecordIdTS {
  async apply(noteId: number): Promise<RecordFilesProjection> {
    // Returns a projection, not a DTO
  }
}
```

### Mapping to DTO in an Action (when needed)

```typescript
@RecordsController()
export class FetchFilesByRecordIdAction {
  @Get('/:noteId/files')
  async apply(
    @Param('noteId') noteId: string,
  ): Promise<FetchFilesByRecordIdResponseDTO> {
    // Service returns projection, structurally compatible with DTO
    return await this.service.fetchFilesByRecordId(noteId);
  }
}
```

---

## Pattern Flow

```
HTTP Request → DTO (validated) → Action → Command → Service → Projection → Action → DTO → HTTP Response
                 ↓                                                ↓
           @ApiProperty                                     Plain types
           @IsString                                      (no decorators)
```

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Type name | `{Entity}Projection` or `{Action}{Entity}Projection` | `RecordFilesProjection`, `CaseDetailProjection` |
| File name | `{purpose}.projection.ts` | `note-files.projection.ts` |
| Location | Next to the Transaction Script that produces it | `{ts-name}-TS/{purpose}.projection.ts` |
| Variable name (in domain) | `projection` | Never `dto` in domain code |
| Variable name (in tests) | `mockProjection`, `expectedProjection` | |

### Critical Rule: No "Dto" in Domain

The domain layer must NOT use "Dto" in type names, class names, or file names. This is enforced by `npm run test:naming`.

| Layer | Input naming | Output naming |
| ----- | ------------ | ------------- |
| Domain (input) | `{Action}{Entity}Command`, `{Action}{Entity}Params` | |
| Domain (output) | | `{Entity}Projection`, `{Action}{Entity}Projection` |
| Application | `{Action}{Entity}RequestDTO` | `{Action}{Entity}ResponseDTO` |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Using DTOs as domain return types | Leaks application-layer decorators into domain | Define plain Projections in the domain layer |
| Naming a domain type `*Dto` | Violates domain naming rules; caught by fitness function | Use `*Projection` for outputs, `*Command`/`*Params` for inputs |
| Returning Entities from Transaction Scripts | Leaks persistence details; couples consumers to DB schema | Map to Projections before returning |
| Adding `@ApiProperty()` to domain types | Framework coupling in the domain layer | Swagger decorators belong on DTOs in the application layer |
