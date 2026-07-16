# Chronus — Agent instructions

This file (`AGENTS.md`) is the **canonical instruction set** for AI assistants working in this repository. It is auto-discovered by Hermes, Claude Code, and similar agent frameworks. Editor-specific copies may exist under `.cursor/` for IDE features; when they disagree, **treat this document as authoritative**.

---

## 1. Agent (default behavior)

You are a senior engineer on **Chronus**: a monorepo with a **NestJS** backend and a **React** frontend. The codebase follows **DDD**, **Hexagonal (ports/adapters)**, and **layered** architecture.

### 1.1 Non-negotiables

- **Backend**: Actions call **Services** only; Services orchestrate **Transaction Scripts**; domain logic lives in Transaction Scripts; **Aggregators** handle cross-domain reads/coordination; **Repositories** are data-only.
- **No same-level injection** among Transaction Scripts, Mappers, Assemblers, or Aggregators (orchestrate one level up).
- **Blackbox rule**: If a Mapper uses a Converter, the Transaction Script uses the Mapper -- not the Converter directly (unless no Mapper/Assembler uses that Converter).
- **Cross-domain**: No entity references across bounded contexts; use **Aggregators** (and shared-kernel join entities when appropriate).
- **Tests**: Co-locate in `__specs__/` next to the subject; name the system under test `target`; prefer Arrange-Act-Assert.
- **Types**: Prefer `type` over `interface` for object shapes unless extending declaration merging is required.
- **Style**: Match existing files; avoid drive-by refactors; keep changes minimal and purposeful.

### 1.2 How to work in this repo

1. **Locate** the module under `src/{module}/` (or shared areas) before editing.
2. **Follow** the request path: Action -> Service -> Transaction Script -> Repository.
3. **Verify** naming and folder layout against the reference sections below.
4. **Run** or add tests next to code you change when the area already uses tests.

### 1.3 Stack snapshot

| Area | Stack |
|------|--------|
| Backend | NestJS, TypeORM, class-validator DTOs |
| Frontend | React, TypeScript, MUI, modular CSS/SCSS, React Query |

---

## 2. Skills (procedures -- when to apply what)

Use the triggers below to decide which reference section or Hermes skill to consult.

| Trigger | Hermes skill | Reference |
|---------|-------------|-----------|
| Add or change an API endpoint | `chronus-new-endpoint` | 3.1, 3.2, 3.5 |
| Domain rule or use case change | `chronus-architecture-review` | 3.1, 3.3, 3.4 |
| Cross-module read/write | `chronus-cross-domain` | 3.4 |
| Persistence only | -- | 3.2, 3.7 |
| React UI | `chronus-new-frontend-page` | 3.8 |
| Tests | -- | 3.9 |
| UI polish / responsive | -- | 3.10 |

---

## 3. References (depth -- consult as needed)

### 3.1 Backend -- directory shape and request flow

```
src/{module-name}/
  apps/actions/{action-name}/
    {action-name}.action.ts
    {action-name}.swagger.ts
  apps/dtos/requests/ and responses/
  domain/services/{service-name}.service.ts
  domain/transaction-scripts/{ts-name}-ts/
    {ts-name}.transaction.script.ts
    __specs__/{ts-name}.transaction.script.spec.ts
  domain/entities/{entity-name}.entity.ts
  domain/aggregators/
  infra/repositories/{repo-name}.repository.ts
  {module}.module.ts
```

**Flow:** Action -> Service -> Transaction Script -> Repository. Service uses Aggregator for cross-domain. Responder maps entities to DTOs.

> Full worked endpoint example in `backend/AGENTS.md`.

---

### 3.2 Dependency rules

| Component | Can inject | Cannot inject |
|-----------|------------|---------------|
| Converters | Nothing | Repos, TS, Services, other Converters |
| Assemblers | Converters, Repos (shallow) | TS, Services, Mappers |
| Mappers | Assemblers, Converters, Repos | TS, Services |
| Transaction Scripts | Repos, Mappers, Aggregators, Converters* | Services, other TS |
| Domain Services | TS, Aggregators, Repos | Other Services, Mappers |
| Aggregators | TS, Repos | Services, other Aggregators |
| Repositories | TypeORM Repo, other Repos | TS, Services, Converters |

*Converter only if not already used inside a Mapper/Assembler (Blackbox).

**Key rules:** (1) No same-level injection. (2) Blackbox -- higher layers use composed abstractions. (3) Entities stay in their domain. (4) TS own use-case logic. (5) M:N join entities may live in `shared-kernel/domain/entities/`.

---

### 3.3 Blackbox principle

If A uses B, and B uses C, then A depends only on B. B is a **blackbox** for A.

**Hierarchy (high to low):** Entry points -> Domain Services -> Aggregators -> Transaction Scripts -> Mappers -> Assemblers -> Converters -> Repositories -> Dispatchers/RemoteCallers.

**Exception**: If no Mapper/Assembler uses the Converter, a Transaction Script may use it directly.

> Full correct/incorrect code examples in the `chronus-architecture-review` Hermes skill.

---

### 3.4 Cross-domain communication

- **Do not** reference entities from another domain inside an entity.
- **Do** expose behavior/data through **Aggregators** in the owning domain.
- **Join entities** for M:N relationships may live in `shared-kernel/domain/entities/` (anemic, no business logic).

> Full worked examples in the `chronus-cross-domain` Hermes skill.

---

### 3.5 Pattern glossary (quick)

- **Transaction Script** -- one use case; `{feature}.transaction.script.ts`; main method `execute` or `apply`.
- **Domain Service** -- orchestrates scripts + aggregators; `{feature}.service.ts`.
- **Aggregator** -- cross-domain queries/operations for other modules to call.
- **Repository** -- persistence wrapper around TypeORM.
- **Entity** -- TypeORM entity in `domain/entities/` or shared entities path.

---

### 3.6 TypeScript and NestJS style

- Short functions (single purpose); early returns over deep nesting.
- **RO-RO**: pass/return objects when arity grows.
- **Naming**: PascalCase classes; camelCase members; kebab-case files; `is`/`has`/`can` for booleans; UPPER_SNAKE for env and stable constants.
- **Immutability**: `const`, `readonly`, `as const` where appropriate.
- **Imports**: one export per file; order external -> internal -> relative.
- **Errors**: `NotFoundException`, `BadRequestException`, etc. for API-facing failures.

---

### 3.7 DDD + TypeORM split

| Layer | TypeORM in domain? | Cross-domain imports | Business logic |
|-------|--------------------|----------------------|----------------|
| Domain | No | No (types from shared-kernel only) | Yes |
| Infrastructure | Yes | Yes (infra concerns) | No |

---

### 3.8 Frontend (React + MUI + modular CSS/SCSS)

- **Styling**: MUI `sx` for layout/spacing; CSS Modules (`.module.css`) co-located with components for complex rules. Global tokens in `frontend/src/styles/global.scss`. **No Tailwind**.
- **Events**: `handleClick`, `handleKeyDown`, etc.
- **Accessibility**: keyboard support, labels, focus order.
- **Components**: `const` arrow functions; props as `type` alias.
- **MUI X**: consult current docs -- do not rely on memorized APIs.

> Full page + CSS Module example in `frontend/AGENTS.md` and the `chronus-new-frontend-page` Hermes skill.

---

### 3.9 Testing

- **Backend (Jest)**: Arrange-Act-Assert; `__specs__/` adjacent to subject; SUT variable name `target`.
- **Frontend**: exercise public component behavior; mock network and external modules as the project already does.

---

### 3.10 UI/UX expectations

- Clear hierarchy, consistent patterns, WCAG-oriented accessibility, visible loading and error states, responsive/mobile-first layout, adequate touch targets (~44px minimum where applicable).

---

## 4. Pattern reference docs

Full DDD pattern documentation (24 pages covering all patterns with dependency rules, anti-patterns, naming conventions, and worked examples) is in `backend/docs/patterns/`.

- Start with `backend/docs/patterns/design-philosophy.md` -- the three paradigms and four design goals
- Then `backend/docs/patterns/dependency-hierarchy.md` -- master dependency graph and injection matrix
- Index: `backend/docs/patterns/README.md`

The `backend/AGENTS.md` file has a pattern inventory table showing which patterns are in use in this codebase and a full naming conventions summary.

---

## 5. Agent-tool integration

Auto-discovered by **Hermes**, **Claude Code**, and similar frameworks. Hermes skills live in `.hermes/skills/`; subdirectory hints in `backend/AGENTS.md` and `frontend/AGENTS.md`. Update sections 1-4 when architecture changes.
