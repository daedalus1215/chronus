---
tags: [architecture, domain-layer, typeorm]
---

# Entity Pattern

## Purpose

An **Entity** represents a domain object that maps to a database table. Entities are the persistence layer's data model — they define the structure and relationships of data stored in the database.

Entities are the answer to: *"How is domain data structured and persisted?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Represent a database table and its relationships | **Entity** |
| Define read-only output from domain components | Projection |
| Transfer data across layer boundaries (API contracts) | DTO |

Use an Entity when:

- You need a **TypeORM mapping** to a database table
- The object has an **identity** (primary key) and **lifecycle** (created, modified, deleted)
- Relationships to other tables need to be expressed via decorators (`@OneToMany`, `@ManyToOne`, etc.)

---

## Key Characteristics

1. **TypeORM decorators** — `@Entity()`, `@Column()`, `@PrimaryColumn()`, `@OneToMany()`, etc.
2. **Domain identity** — each entity has a primary key, often using branded types for type safety.
3. **Belongs to a domain** — entities live within their owning domain's folder.
4. **Shared entities are stable** — entities used across domains live in `src/shared/shared-entities/entities/` and should change infrequently.

---

## Anatomy

### Domain-Specific Entity

```typescript
@Entity('cases')
export class Case {
  @PrimaryColumn({ type: 'integer' })
  id!: CaseId;

  @Column({ name: 'short_name', type: 'varchar' })
  shortName!: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName!: string;
}
```

### Shared Entity

```typescript
@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id!: FileId;

  @Column({ name: 'bucket', type: 'varchar' })
  bucket!: string;

  @Column({ name: 'file_path', type: 'varchar' })
  filePath!: string;

  @ManyToOne(() => FileAttachment)
  @JoinColumn({ name: 'file_attachment_id' })
  fileAttachment!: FileAttachment;
}
```

### Branded Type for Type-Safe IDs

```typescript
type Brand<T, B> = T & { __brand: B };
export type CaseId = Brand<number, 'CaseId'>;
export type FileId = Brand<number, 'FileId'>;
```

---

## Domain Boundaries

### Entity Ownership

| Location | Scope | Example |
| -------- | ----- | ------- |
| `{module}/domain/entities/` | Domain-specific — used only within that module | `Case`, `CaseRestrictionLevel` |
| `src/shared/shared-entities/entities/` | Shared — used across multiple domains | `File`, `FileAttachment`, `Job`, `Record` |

### No Cross-Domain Entity References

Entities from one domain must not directly reference entities from another domain via TypeORM relationships.

**Correct:**

```typescript
@Entity('cases')
export class Case {
  @PrimaryColumn()
  id!: CaseId;
  // No @OneToMany to Record — Record belongs to the notes domain
}
```

**Incorrect:**

```typescript
@Entity('cases')
export class Case {
  @OneToMany(() => Record, (record) => record.case)
  notes!: Record[];  // ❌ Record is in the notes domain
}
```

Use **Aggregators** for cross-domain data access instead of cross-domain entity relationships.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{EntityName}` (PascalCase, singular) | `Case`, `File`, `FileAttachment` |
| File name | `{entity-name}.entity.ts` | `case.entity.ts`, `file.entity.ts` |
| Table name | Snake_case, plural | `cases`, `file_attachments` |
| Domain-specific location | `{module}/domain/entities/` | `src/cases/domain/entities/case.entity.ts` |
| Shared location | `src/shared/shared-entities/entities/` | `src/shared/shared-entities/entities/file.entity.ts` |
| Branded ID type | `{Entity}Id` | `CaseId`, `FileId` |

---

## Audit Columns

For Chronus-owned tables, follow the audit column convention:

```typescript
@Column({ name: 'created_user_identity', type: 'varchar' })
createdUserIdentity!: string;

@Column({ name: 'modified_user_identity', type: 'varchar', nullable: true })
modifiedUserIdentity?: string;
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Cross-domain entity relationships | Breaks domain boundary isolation | Use Aggregators for cross-domain data access |
| Business logic in entity methods | Entities are data structures, not behavior | Business logic belongs in Transaction Scripts |
| Using entities as API response types | Leaks persistence details to consumers | Use Projections and DTOs for API contracts |
| Modifying shared entities frequently | Shared entities should be stable; changes ripple across domains | Consider whether a domain-specific entity is more appropriate |
