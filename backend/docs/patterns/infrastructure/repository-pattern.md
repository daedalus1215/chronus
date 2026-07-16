---
tags: [architecture, infrastructure-layer, typeorm]
---

# Repository Pattern

## Purpose

A **Repository** handles all database operations and data access for a specific entity. It encapsulates TypeORM queries behind a clean interface, providing optimized data retrieval methods that the domain layer can consume without coupling to SQL or query builder details.

Repositories are the answer to: *"Where does data access logic live, and how do we keep it separate from business logic?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Query or persist data for a specific entity | **Repository** |
| Assemble complex objects from multiple data sources | Assembler |
| Transform data between representations | Converter |

Use a Repository when:

- You need to **read from or write to** a database table
- A query requires **TypeORM query builder** or specific SQL optimization
- Multiple domain components need the **same data access method**

---

## Key Characteristics

1. **Data access layer** — all SQL and TypeORM queries live here.
2. **One per entity (typically)** — focused on a single table, though related-data joins are common.
3. **TypeORM integration** — uses `@InjectRepository()` for the base TypeORM repository.
4. **Query optimization** — implements efficient queries, selective column loading, pagination.
5. **Error handling** — throws meaningful errors for not-found or constraint violations.

---

## Anatomy

### Basic Repository

```typescript
@Injectable()
export class CaseRepository {
  constructor(
    @InjectRepository(Case)
    private readonly repo: Repository<Case>,
  ) {}

  async findById(id: number): Promise<Case> {
    const entity = await this.repo.findOneBy({ id: id as CaseId });
    if (!entity) {
      throw new Error(`Case with ID ${id} not found`);
    }
    return entity;
  }
}
```

### Repository with Query Builder

```typescript
@Injectable()
export class CaseFileRepository {
  constructor(
    @InjectRepository(FileAttachment)
    private readonly repo: Repository<FileAttachment>,
  ) {}

  async fetchCaseFileAttachments(caseId: number): Promise<FileAttachment[]> {
    return this.repo
      .createQueryBuilder('fileAttachment')
      .innerJoinAndSelect('fileAttachment.file', 'file')
      .innerJoinAndSelect('fileAttachment.fileCaseCategory', 'category')
      .where('fileAttachment.caseId = :caseId', { caseId })
      .getMany();
  }
}
```

### Repository Injecting Another Repository

```typescript
@Injectable()
export class FileAttachmentRepository {
  constructor(
    @InjectRepository(FileAttachment)
    private readonly repo: Repository<FileAttachment>,
    private readonly fileTagRepository: FileTagRepository,
  ) {}

  async create(fileAttachment: FileAttachment): Promise<FileAttachment> {
    return this.repo.save(fileAttachment);
  }
}
```

---

## Hierarchy Position

Repositories sit at the bottom of the dependency hierarchy, consumed by patterns above:

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
Converters
  ↓
Repositories    ← this level
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | TypeORM Repository (`@InjectRepository`), other Repositories (for related data) |
| **Cannot inject** | Transaction Scripts, Domain Services, Converters, Assemblers, Mappers |
| **Injected by** | Transaction Scripts, Assemblers (shallow), Mappers, Domain Services (simple lookups), Aggregators (simple lookups) |

### Shallow Usage in Assemblers

When Assemblers inject Repositories, the usage must be **shallow** — simple data retrieval only, not complex business-logic queries.

---

## Folder Structure

```
{module}/
└── infrastructure/
    └── repositories/
        ├── {repository-name}.repository.ts
        └── __specs__/
            └── {repository-name}.repository.spec.ts
```

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Entity}Repository` or `{Purpose}Repository` | `CaseRepository`, `SearchCasesByNameRepository` |
| File name | `{repository-name}.repository.ts` | `case.repository.ts` |
| Folder | `{module}/infrastructure/repositories/` | `src/cases/infrastructure/repositories/` |
| Spec file | `{repository-name}.repository.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Sorting Responsibility

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Business logic in a Repository | Repositories are data access, not decision-making | Move business rules to Transaction Scripts |
| Repository injecting a Transaction Script | Dependency flows the wrong direction | Transaction Scripts consume Repositories, not the other way |
| Non-trivial sort in SQL | Ties sorting to the database; not portable or testable | Move complex sort logic to the application layer |
| Fat queries returning unused columns | Wasteful; impacts performance | Select only needed columns; use projections in query builder |
| Repository injecting a Converter | Data transformation belongs at a higher level | Let Transaction Scripts or Assemblers handle conversion |
