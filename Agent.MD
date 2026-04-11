# Chronus — Agent instructions

This file is the **canonical instruction set** for AI assistants working in this repository (including Claude). Editor-specific copies may exist under `.cursor/` for IDE features; when they disagree, **treat this document as authoritative** unless the team updates it.

---

## 1. Agent (default behavior)

You are a senior engineer on **Chronus**: a monorepo with a **NestJS** backend and a **React** frontend. The codebase follows **DDD**, **Hexagonal (ports/adapters)**, and **layered** architecture.

### 1.1 Non‑negotiables

- **Backend**: Actions call **Services** only; Services orchestrate **Transaction Scripts**; domain logic lives in Transaction Scripts; **Aggregators** handle cross-domain reads/coordination; **Repositories** are data-only.
- **No same-level injection** among Transaction Scripts, Mappers, Assemblers, or Aggregators (orchestrate one level up).
- **Blackbox rule**: If a Mapper uses a Converter, the Transaction Script uses the Mapper—not the Converter directly (unless no Mapper/Assembler uses that Converter).
- **Cross-domain**: No entity references across bounded contexts; use **Aggregators** (and shared-kernel join entities when appropriate).
- **Tests**: Co-locate in `__specs__/` next to the subject; name the system under test `target`; prefer Arrange–Act–Assert.
- **Types**: Prefer `type` over `interface` for object shapes unless extending declaration merging is required.
- **Style**: Match existing files; avoid drive-by refactors; keep changes minimal and purposeful.

### 1.2 How to work in this repo

1. **Locate** the module under `src/{module}/` (or shared areas) before editing.
2. **Follow** the request path: Action → Service → Transaction Script → Repository.
3. **Verify** naming and folder layout against the reference sections below.
4. **Run** or add tests next to code you change when the area already uses tests.

### 1.3 Stack snapshot

| Area | Stack |
|------|--------|
| Backend | NestJS, TypeORM, class-validator DTOs |
| Frontend | React, TypeScript, MUI, modular CSS/SCSS, React Query |

---

## 2. Skills (procedures — when to apply what)

In Claude terms, **skills** are *procedural*: “when task X, do steps Y.” This repo does not require separate `SKILL.md` files for you to be effective; use the **Skill triggers** below and jump to the linked **Reference** section.

| Skill trigger | Goal | Read first |
|---------------|------|------------|
| **Add or change an API endpoint** | New/changed HTTP surface | §3.1 Request flow, §3.2 Dependency rules, §3.5 Naming |
| **Domain rule or use case change** | Business logic | §3.1, §3.3 Blackbox, §3.4 Cross-domain |
| **Cross-module read/write** | Avoid coupling | §3.4 Cross-domain, Aggregators |
| **Persistence only** | Queries, mappings | §3.2 Repositories, §3.7 DDD + TypeORM |
| **React UI** | Components, a11y, MUI + SCSS | §3.8 Frontend |
| **Tests** | Unit/integration style | §3.9 Testing |
| **UI polish / responsive** | UX constraints | §3.10 UI/UX |

If you maintain optional **Claude Code**-style skills as separate files later, each should map to one row above and point back to the same reference § for detail.

---

## 3. References (depth — consult as needed)

### 3.1 Backend — directory shape and request flow

**Directory structure (conceptual)**

```
src/
├── {module-name}/
│   ├── application/
│   │   ├── controllers/
│   │   │   └── actions/
│   │   │       └── {action-name}/
│   │   │           ├── {action-name}.action.ts
│   │   │           ├── {action-name}.swagger.ts
│   │   │           └── {action-name}.responder.ts
│   │   └── dtos/
│   │       ├── requests/{dto-name}.dto.ts
│   │       └── responses/{dto-name}.dto.ts
│   ├── domain/
│   │   ├── services/{service-name}.service.ts
│   │   ├── transaction-scripts/{transaction-name}-ts/
│   │   │   ├── {transaction-name}.transaction.script.ts
│   │   │   ├── {transaction-name}.param.ts
│   │   │   └── __specs__/{transaction-name}.transaction.script.spec.ts
│   │   ├── entities/{entity-name}.entity.ts
│   │   ├── exceptions/
│   │   ├── converters/
│   │   └── aggregators/
│   ├── infrastructure/
│   │   └── repositories/{repository-name}.repository.ts
│   ├── registries/
│   └── {module}.module.ts
└── shared/shared-entities/
```

**Module interaction flow**

1. **Action** receives the request and validates input.
2. **Action** calls **Service** (never a Transaction Script directly).
3. **Service** uses an **Aggregator** for cross-domain concerns.
4. **Service** delegates to **Transaction Script** for the use case.
5. **Transaction Script** uses **Repositories** for persistence.
6. **Responder** maps entities to response DTOs.

---

### 3.2 Dependency rules

| Component | Can inject | Cannot inject |
|-----------|------------|----------------|
| Converters | Nothing | Repositories, Transaction Scripts, Services, other Converters |
| Assemblers | Converters, Repositories (shallow) | Transaction Scripts, Services, Mappers |
| Mappers | Assemblers, Converters, Repositories | Transaction Scripts, Services |
| Transaction Scripts | Repositories, Mappers, Aggregators, Converters* | Services, other Transaction Scripts |
| Domain Services | Transaction Scripts, Aggregators, Repositories | Other Domain Services, Mappers, Converters |
| Aggregators | Transaction Scripts, Repositories | Services, other Aggregators |
| Repositories | TypeORM `Repository`, other Repositories | Transaction Scripts, Services, Converters |

\*Converter only if **not** already used inside a Mapper/Assembler (Blackbox Principle).

**Key rules**

1. **No same-level injection** — orchestrate via Domain Service or Aggregator.
2. **Blackbox** — higher layers depend on composed abstractions, not every leaf dependency.
3. **Domain boundaries** — entities stay in their domain; cross-domain via Aggregators.
4. **Transaction Scripts** own domain logic for a use case.
5. **Join entities** that only model M:N persistence may live under `shared-kernel/domain/entities/`.

---

### 3.3 Blackbox principle

If pattern A uses B, and B uses C, then A should only depend on B. B is a **blackbox** for A.

**Dependency hierarchy (high → low)**

```
Entry points (application)
  → Domain Services
  → Aggregators
  → Transaction Scripts
  → Mappers
  → Assemblers
  → Converters (no dependencies)
  → Repositories
  → Dispatchers / RemoteCallers
```

**Correct (Transaction Script uses Mapper that uses Converter)**

```typescript
@Injectable()
export class InvoiceToDtoConverter {
  apply(entity: Invoice): InvoiceDto {
    return {
      id: entity.id,
      total: Number(entity.total),
      balanceDue: Number(entity.balanceDue),
    };
  }
}

@Injectable()
export class InvoiceWithPaymentsMapper {
  constructor(private readonly invoiceToDtoConverter: InvoiceToDtoConverter) {}

  map(invoice: Invoice, payments: Payment[]): InvoiceWithPaymentsDto {
    return {
      invoice: this.invoiceToDtoConverter.apply(invoice),
      payments: payments.map((p) => ({ id: p.id, amount: p.amount })),
    };
  }
}

@Injectable()
export class GetInvoiceWithPaymentsTransactionScript {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly paymentRepository: PaymentApplicationRepository,
    private readonly invoiceWithPaymentsMapper: InvoiceWithPaymentsMapper,
  ) {}

  async execute(invoiceId: number): Promise<InvoiceWithPaymentsDto> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    const payments = await this.paymentRepository.findByInvoiceId(invoiceId);
    return this.invoiceWithPaymentsMapper.map(invoice, payments);
  }
}
```

**Incorrect**: Transaction Script also injects `InvoiceToDtoConverter` when the Mapper already uses it.

**Exception**: If no Mapper/Assembler uses the Converter, a Transaction Script may use the Converter directly.

---

### 3.4 Cross-domain communication

- **Do not** reference entities from another domain inside an entity (no cross-domain ORM graph for unrelated aggregates).
- **Do** expose behavior/data through **Aggregators** in the owning domain.

**Join entity exception** (shared-kernel, anemic):

```typescript
@Entity({ name: 'tag_notes' })
export class TagNote {
  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;

  @PrimaryColumn({ name: 'note_id' })
  noteId: number;
}
```

---

### 3.5 Pattern glossary (quick)

- **Transaction Script** — one use case; `{feature}.transaction.script.ts`; main method typically `execute` or `apply` per module convention.
- **Domain Service** — orchestrates scripts + aggregators; `{feature}.service.ts`.
- **Aggregator** — cross-domain queries/operations for other modules to call.
- **Repository** — persistence wrapper around TypeORM.
- **Entity** — TypeORM entity in `domain/entities/` or shared entities path as per module.

---

### 3.6 TypeScript and NestJS style

- Prefer **short functions** (single purpose); **early returns** over deep nesting.
- **RO-RO**: pass/return objects when arity grows.
- **Naming**: PascalCase classes; camelCase members; kebab-case files; `is`/`has`/`can` for booleans; UPPER_SNAKE for env and stable constants.
- **Immutability**: `const`, `readonly`, `as const` where appropriate.
- **Imports**: one export per file; order external → internal → relative; use project path aliases (e.g. `@/`).
- **Errors**: `NotFoundException`, `BadRequestException`, etc. for API-facing failures; add context when catching to rethrow.

---

### 3.7 DDD + TypeORM split

| Layer | TypeORM in domain? | Cross-domain imports | Business logic |
|-------|--------------------|----------------------|----------------|
| Domain | No | No (types from shared-kernel only) | Yes |
| Infrastructure | Yes | Yes (infra concerns) | No |

Pure domain types without ORM are ideal in domain; persistence models live in infrastructure when you use this split strictly.

---

### 3.8 Frontend (React + MUI + modular CSS/SCSS)

- **Styling**: Use **MUI** (`sx`, theme) for component styling and layout. Use **CSS Modules** (`.module.css`) or **SCSS** partials colocated with components for complex or reusable rules. Global tokens live in `frontend/src/styles/global.scss`. Do **not** add Tailwind or other utility-class frameworks unless the team explicitly reintroduces them.
- **Events**: name handlers `handleClick`, `handleKeyDown`, etc.
- **Accessibility**: keyboard support, labels, and focus order for interactive controls.
- **Components**: prefer `const` component declarations; keep props as a `type` alias.

Example:

```typescript
type MyComponentProps = {
  readonly title: string;
  readonly onAction: () => void;
};

const MyComponent = ({ title, onAction }: MyComponentProps) => {
  return (
    <button type="button" onClick={onAction} aria-label={title}>
      {title}
    </button>
  );
};
```

**MUI X / Data Grid / Pickers**: when behavior or API is non-obvious, consult **current** MUI X docs (project may use MCP or official docs)—do not rely on memorized APIs alone.

---

### 3.9 Testing

- **Backend (Jest)**: Arrange–Act–Assert; `__specs__/` adjacent to subject; SUT variable name `target`.
- **Frontend**: exercise public component behavior; mock network and external modules as the project already does.

---

### 3.10 UI/UX expectations

- Clear hierarchy, consistent patterns, WCAG-oriented accessibility, visible loading and error states, responsive/mobile-first layout, adequate touch targets (~44px minimum where applicable).

---

## 4. Optional: Claude Code hooks

If you use **Claude Code** with project skills:

- Keep **Agent** material short at the top of this file (§1).
- Move rarely needed prose to `docs/` only when duplication hurts maintenance.
- Add `SKILL.md` files under `.claude/skills/<name>/` whose **description** frontmatter matches the Skill trigger table in §2 and points to the same §3 reference headings.

This repository may add those files later; nothing here requires them.

---

## 5. Document history note

Content originated from team architecture rules and was consolidated for **portable agent use** (not tied to a single editor). Update §1–§3 when architecture changes; avoid scattering duplicate rules.
