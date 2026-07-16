---
tags: [architecture, application-layer, nestjs]
---

# Action Pattern

## Purpose

An **Action** is an individual HTTP endpoint extracted into its own class. Instead of placing all endpoints in a single monolithic controller, each route handler is a separate `@Injectable()` class that shares a common controller decorator. Actions are the entry points into the application — they receive HTTP requests, validate input via DTOs, delegate to Domain Services, and return responses.

Actions are the answer to: *"How do we keep controllers thin and each endpoint independently organized?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Define an HTTP endpoint (GET, POST, PUT, DELETE, PATCH) | **Action** |
| Define the request/response contract with validation | DTO |
| Orchestrate business logic triggered by the request | Domain Service |

Use an Action when:

- A new HTTP endpoint is needed for an API route
- Each endpoint should be **independently testable** and **independently documented** (Swagger)

---

## Key Characteristics

1. **One class per endpoint** — each Action handles a single HTTP route.
2. **Shared controller decorator** — a factory function applies `@Controller()`, `@ApiTags()`, `@ApiBearerAuth()`, and `@UseFilters()` once.
3. **Colocated Swagger** — each Action has a companion `.swagger.ts` file for API documentation decorators.
4. **Optional Responder** — complex response formatting logic can be extracted into a `.responder.ts` class.
5. **Delegates to Domain Service** — Actions do not contain business logic; they call the Service and return the result.
6. **GET handlers start with `Fetch`** — not `Get`. This avoids confusion with the `@Get()` decorator.

---

## Anatomy

### Controller Decorator Factory

```typescript
// application/controllers/cases.controller.ts
export const CasesController = () =>
  applyDecorators(
    Controller('/cases'),
    ApiBearerAuth('JWT-auth'),
    ApiTags('Cases'),
    UseFilters(AllExceptionsFilter),
  );
```

### Action Class

```typescript
// application/controllers/actions/fetch-case-files/fetch-case-files.action.ts
@CasesController()
export class FetchCaseFilesAction {
  constructor(private readonly caseService: CaseService) {}

  @Get('/files/:id')
  @FetchCaseFilesSwagger()
  async apply(@Param('id', new ParseIntPipe()) id: number) {
    return this.caseService.getCaseFiles(id);
  }
}
```

### Swagger Companion

```typescript
// application/controllers/actions/fetch-case-files/fetch-case-files.swagger.ts
export const FetchCaseFilesSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Fetch files attached to a case',
      description: 'Returns all files grouped by category for the given case ID.',
    }),
    ApiParam({ name: 'id', type: Number, description: 'Case ID' }),
    ApiResponse({ status: 200, description: 'Files grouped by category' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
};
```

### Action with Guards and Body

```typescript
@HistoricalFilesController()
export class CopyFile {
  constructor(private readonly historicalService: HistoricalFilesService) {}

  @Post('/:driveKey/copy-file')
  @CopyFileSwagger()
  @UseGuards(ModifyAuthGuard)
  apply(
    @DriveKeyParam() driveKey: DriveKey,
    @Body('originKey') originKey: string,
    @Body('destinationKey') destinationKey: string,
  ) {
    return this.historicalService.copyFile(driveKey, originKey, destinationKey);
  }
}
```

---

## Folder Structure

```
{module}/
└── application/
    └── controllers/
        ├── {module}.controller.ts           ← shared decorator factory
        └── actions/
            └── {action-name}/
                ├── {action-name}.action.ts      ← endpoint class
                ├── {action-name}.swagger.ts      ← API documentation
                └── {action-name}.responder.ts    ← optional response formatter
```

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name (GET) | `Fetch{Resource}Action` | `FetchCaseFilesAction`, `FetchCaseDetailByIdAction` |
| Class name (POST) | `{Verb}{Resource}Action` or `{Verb}{Resource}` | `CopyFile`, `SubmitJobAction` |
| File name | `{action-name}.action.ts` | `fetch-case-files.action.ts` |
| Swagger file | `{action-name}.swagger.ts` | `fetch-case-files.swagger.ts` |
| Responder file | `{action-name}.responder.ts` | `fetch-case-files.responder.ts` |
| Folder | `actions/{action-name}/` | `actions/fetch-case-files/` |
| Controller decorator | `{Module}Controller` | `CasesController` |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Business logic in an Action | Actions are thin entry points; logic belongs in the domain | Delegate to a Domain Service or Transaction Script |
| Multiple endpoints in one Action class | Defeats the purpose of one-class-per-endpoint | Create separate Action classes for each route |
| Swagger decorators inline on the method | Clutters the Action; harder to maintain | Extract to a companion `.swagger.ts` file |
| GET handler named `GetCaseFiles` | Ambiguous with the `@Get()` decorator | Use `Fetch` prefix: `FetchCaseFilesAction` |
| Action directly injecting a Transaction Script | Skips the Service orchestration layer | Actions inject Domain Services; Services inject Transaction Scripts |
