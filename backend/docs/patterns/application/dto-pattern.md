---
tags: [architecture, application-layer, validation]
---

# DTO Pattern

## Purpose

A **DTO (Data Transfer Object)** transfers data across layer boundaries — specifically between the HTTP API surface and the domain layer. DTOs define the API contract: what the client sends (Request DTOs) and what the server returns (Response DTOs).

DTOs are the answer to: *"How do we validate incoming requests and document outgoing responses without coupling the domain to framework concerns?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Define an API request contract with validation decorators | **Request DTO** |
| Define an API response shape with Swagger decorators | **Response DTO** |
| Define domain output (no decorators, framework-agnostic) | Projection |
| Define domain input (no decorators) | Command / Params |

Use a DTO when:

- The data crosses the **HTTP boundary** (request or response)
- You need **class-validator decorators** (`@IsString()`, `@IsNumber()`, etc.) for input validation
- You need **Swagger decorators** (`@ApiProperty()`) for API documentation

---

## Key Characteristics

1. **Classes with decorators** — DTOs are classes (not types) so class-validator and Swagger decorators can be applied.
2. **Application layer only** — DTOs live in the `application/` folder, never in `domain/`.
3. **Validation on requests** — Request DTOs use class-validator decorators.
4. **Documentation on responses** — Response DTOs use `@ApiProperty()` for Swagger.
5. **Separate from Projections** — DTOs and Projections may have the same shape, but they serve different purposes and live in different layers.

---

## Anatomy

### Request DTO

```typescript
// application/dtos/requests/create-records.dto.ts
export class CreateRecordsDTO {
  @IsNumber()
  jobId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  values!: string[];
}
```

### Response DTO

```typescript
// application/dtos/responses/fetch-case-detail.response.dto.ts
export class FetchCaseDetailResponseDTO {
  @ApiProperty({ description: 'The case ID' })
  caseID!: string;

  @ApiProperty({ description: 'Short name of the case' })
  caseShortName!: string;

  @ApiProperty({ description: 'Full name of the case' })
  caseFullName!: string;
}
```

### Infrastructure DTO (for internal transfer)

```typescript
// infrastructure/dtos/assembled-job-submission.dto.ts
export type AssembledJobSubmissionDto = {
  event: { name: string; traceId: string };
  files: JobSubmissionFilesDomainEvent['files'];
  jobSubmissionDetails: JobSubmissionDetailsDomainEvent;
  identity: { userId: string; userEmail: string };
};
```

---

## Pattern Flow

```
HTTP Request → Request DTO (validated) → Action → Command → Service
                                                              ↓
HTTP Response ← Response DTO ← Action ← Projection ← Service
```

- **Request DTOs** are validated by the NestJS `ValidationPipe` before reaching the Action.
- **Commands** are plain types created from the validated DTO — no decorators, domain-pure.
- **Projections** are plain types returned from the domain — structurally compatible with Response DTOs.
- When the Projection shape matches the Response DTO exactly, the Action can return the Projection directly (structural typing).

---

## Folder Structure

```
{module}/
└── application/
    ├── controllers/
    │   └── actions/
    │       └── {action-name}/
    │           └── {action-name}.action.ts    ← may colocate DTOs here
    └── dtos/
        ├── requests/
        │   └── {dto-name}.dto.ts
        └── responses/
            └── {dto-name}.dto.ts
```

DTOs can be colocated with their Action or placed in the shared `dtos/` folder — use proximity to the consumer.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Request DTO | `{Action}{Entity}RequestDTO` | `UploadStartRecordFileRequestDTO` |
| Response DTO | `{Action}{Entity}ResponseDTO` | `FetchFilesByRecordIdResponseDTO` |
| File name | `{purpose}.dto.ts` | `fetch-case-detail.response.dto.ts` |
| Variable name (application) | `requestDto`, `responseDto`, or `dto` | |
| Variable name (tests) | `mockDto`, `inputDto` | |

### Critical: No "Dto" in Domain

The domain layer must NOT use "Dto" in type names, class names, or file names. Domain inputs are **Commands** or **Params**; domain outputs are **Projections**.

| Layer | Input | Output |
| ----- | ----- | ------ |
| Application | `*RequestDTO` | `*ResponseDTO` |
| Domain | `*Command`, `*Params` | `*Projection` |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Using DTOs in the domain layer | Leaks framework decorators into domain code | Use Commands/Params for domain input, Projections for domain output |
| Naming a domain type `*Dto` | Violates domain naming rules; caught by `npm run test:naming` | Use `*Projection`, `*Command`, or `*Params` |
| Skipping validation on Request DTOs | Untrusted input reaches the domain layer | Apply class-validator decorators and use `ValidationPipe` |
| Returning Entities as API responses | Leaks persistence details to consumers | Map Entities to Projections (domain) and Projections to Response DTOs (application) |
| Using plain types for Request DTOs | class-validator requires classes with decorators | Request DTOs must be classes, not type aliases |
