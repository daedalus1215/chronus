---
tags: [architecture, nestjs, dependency-injection]
---

# Registry Pattern

## Purpose

A **Registry** is a simple array export that lists all providers of a specific type within a module. Registries keep module configuration clean by centralizing provider lists — instead of inlining dozens of classes in the `@Module()` decorator, the module spreads registry arrays.

Registries are the answer to: *"How do we keep module declarations readable when a module has many Actions, Transaction Scripts, and Repositories?"*

---

## When to Use

Use a Registry whenever a module has **three or more** providers of the same type. Common registries:

| Registry | Contains | Example |
| -------- | -------- | ------- |
| Action Registry | All Action classes (HTTP endpoints) | `FetchCaseDetailByIdAction`, `SearchCasesAction` |
| Transaction Script Registry | All Transaction Scripts + Converters + Assemblers + Mappers | `FetchCaseDetailTS`, `SearchCasesTS` |
| Repository Registry | All Repository classes | `CaseRepository`, `CaseFileRepository` |

---

## Anatomy

### Action Registry

```typescript
// registries/action.registry.ts
export const actionRegistry = [
  FetchCaseDetailByIdAction,
  SearchCasesAction,
  FetchCaseFilesAction,
  FetchCaseFilesCountAction,
  DownloadCaseFiles,
];
```

### Repository Registry

```typescript
// registries/repository.registry.ts
export const repositoryRegistry = [
  CaseRepository,
  CaseFileRepository,
  SearchCasesByNameRepository,
  SearchCasesByIdRepository,
  FetchCaseFilesRepository,
];
```

### Transaction Script Registry

```typescript
// registries/transaction-script.registry.ts
export const transactionScriptRegistry = [
  FetchCaseDetailTS,
  SearchCasesTS,
  FetchCaseFilesTS,
  FetchCaseFilesCountTS,
  FileAttachmentToCaseFilesDtoConverter,
  GroupAndSortCaseFilesAssembler,
];
```

### Module Consuming Registries

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity1, Entity2]),
    AuthModule,
  ],
  controllers: [...actionRegistry],
  providers: [
    CaseService,
    ...transactionScriptRegistry,
    ...repositoryRegistry,
  ],
  exports: [CaseService],
})
export class CasesModule {}
```

---

## Folder Structure

```
{module}/
└── registries/
    ├── action.registry.ts
    ├── repository.registry.ts
    └── transaction-script.registry.ts
```

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| File name | `{type}.registry.ts` | `action.registry.ts`, `repository.registry.ts` |
| Export name | `{type}Registry` | `actionRegistry`, `repositoryRegistry` |
| Folder | `{module}/registries/` | `src/cases/registries/` |

---

## What Goes Where

| Provider Type | Registry |
| ------------- | -------- |
| Action classes | `action.registry.ts` (used in `controllers:`) |
| Transaction Scripts | `transaction-script.registry.ts` (used in `providers:`) |
| Mappers, Assemblers, Converters | `transaction-script.registry.ts` (bundled with their consuming TS) |
| Repositories | `repository.registry.ts` (used in `providers:`) |
| Domain Service | Module `providers:` directly (typically only one per module) |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Inlining 20+ providers in `@Module()` | Unreadable; hard to scan for a specific class | Extract into registries and spread |
| One registry for everything | Loses the benefit of categorization | Separate registries by type (actions, TS, repositories) |
| Registry containing business logic | Registries are just arrays of class references | Keep registries as plain exports with no logic |
