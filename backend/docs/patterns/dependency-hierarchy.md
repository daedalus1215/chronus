---
tags: [architecture, dependency-injection, ddd]
---

# Dependency Hierarchy

## Overview

This document defines the **dependency injection rules** that govern how patterns relate to each other. All patterns follow a strict hierarchy — dependencies flow **downward**, and patterns at the **same level must not inject each other**.

These rules are enforced by dependency-cruiser fitness functions and the `domain-no-application` architectural boundary rule.

---

## The Hierarchy

```
Application Layer (entry points)
  Actions    → Domain Services       (front-end HTTP requests)
  Webhooks   → Domain Services       (back-end HTTP callbacks)
  Listeners  → Domain Services       (queue event messages)
  Pollers    → Runners               (outbox projection polling)
  ↓
Domain Services                      (orchestrate Transaction Scripts)
Runners                              (fetch + assemble outbox descriptors)
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts (can have repo injected)
  ↓
Mappers (can have repo injected)
  ↓
Assemblers (can have repo injected)  ← Runners can also inject Assemblers
  ↓
Converters / Comparators / Validators (level-agnostic — see below)
  ↓
Repositories (shallow, data only)    ← Runners can also inject Repositories
  ↓
Dispatchers (publish events)
RemoteCallers (send out commands)
```

---

## Layer Boundary Rules

Dependencies flow inward:

| Direction | Allowed? |
| --------- | -------- |
| Application → Domain | Yes |
| Infrastructure → Domain | Yes |
| Domain → Application | **No (FORBIDDEN)** |
| Infrastructure → Application | **No (FORBIDDEN)** |

This is enforced by the `domain-no-application` fitness function in `.dependency-cruiser.ts`.

---

## Three Core Rules

### 1. No Same-Level Injection

Patterns at the same level must not inject each other:

| Pattern | Cannot inject |
| ------- | ------------- |
| Transaction Scripts | Other Transaction Scripts |
| Converters | Other Converters |
| Assemblers | Other Assemblers |
| Mappers | Other Mappers |
| Aggregators | Other Aggregators |
| Domain Services | Other Domain Services |
| Dispatchers | Other Dispatchers |
| RemoteCallers | Other RemoteCallers |

**When same-level patterns need to work together, move orchestration up one level:**

| Need | Solution |
| ---- | -------- |
| Multiple Transaction Scripts | Domain Service or Aggregator orchestrates them |
| Multiple Converters | Assembler or Mapper composes them |
| Multiple Assemblers | Mapper orchestrates them |

### 2. Blackbox Principle

If a lower pattern is used by an intermediate pattern, the higher pattern should use the intermediate pattern — not the lower one directly.

**Correct:**

```typescript
// Converter is used by Mapper — Mapper is the blackbox
@Injectable()
export class SomeMapper {
  constructor(private readonly someConverter: SomeConverter) {}
}

@Injectable()
export class SomeTransactionScript {
  constructor(private readonly someMapper: SomeMapper) {}
  // ✅ Uses Mapper, not Converter
}
```

**Incorrect:**

```typescript
@Injectable()
export class SomeTransactionScript {
  constructor(
    private readonly someMapper: SomeMapper,
    private readonly someConverter: SomeConverter, // ❌ Already used by Mapper
  ) {}
}
```

**Exception:** If a Converter is NOT used by any Mapper/Assembler, a Transaction Script can inject it directly.

### 3. Dependencies Point Inward

The domain layer must not depend on the application layer. External systems are abstracted through ports (interfaces + Symbol tokens) so the domain never imports infrastructure or framework concerns.

---

## Full Dependency Matrix

| Component | Can Inject | Cannot Inject |
| --------- | ---------- | ------------- |
| **Converters** | Comparators | Other Converters, Repositories, TS, Services, Assemblers, Mappers |
| **Comparators** | Nothing | Other Comparators, Converters, Repositories, TS, Services, Assemblers, Mappers |
| **Validators** | Whatever the level they occupy allows (e.g., Repositories if at Assembler level) | Patterns above the level they occupy; other Validators at the same level |
| **Assemblers** | Converters, Repositories (shallow) | Other Assemblers, TS, Services, Mappers |
| **Mappers** | Assemblers, Converters, Repositories | Other Mappers, TS, Services |
| **Transaction Scripts** | Repositories, Mappers, Aggregators (via ports), Converters (if not in a Mapper/Assembler) | Other TS, Services, Assemblers (if in a Mapper) |
| **Aggregators** | Transaction Scripts, Repositories (simple lookups) | Services, other Aggregators |
| **Domain Services** | Transaction Scripts, Aggregators (via ports), Repositories (simple lookups) | Other Services, Mappers, Assemblers, Converters |
| **Repositories** | TypeORM Repository, other Repositories | TS, Services, Converters, Assemblers, Mappers |
| **Runners** | Repositories, Assemblers | Transaction Scripts, Domain Services, Mappers, other Runners |
| **Dispatchers** | Repositories, Assemblers | TS, Services, other Dispatchers |
| **RemoteCallers** | Repositories | TS, Services, other RemoteCallers |

---

## Cross-Domain Communication

Domains communicate exclusively through **Aggregators consumed via ports**:

1. **Consuming domain** defines a port type + Symbol token
2. **Providing domain** implements an Aggregator that satisfies the port
3. **NestJS module** wires the Aggregator to the token using `{ provide: TOKEN, useClass: Aggregator }`
4. **Consumer injects** via `@Inject(TOKEN) private readonly agg: AggregatorPort`

Direct imports of another domain's classes are forbidden.

---

## Domain Naming Rules

The domain layer must not use "Dto" in type names, class names, or file names.

| Layer | Input types | Output types |
| ----- | ----------- | ------------ |
| Application | `*RequestDTO`, `*ResponseDTO` | |
| Domain (to Service) | `*Command` | |
| Domain (to TS) | `*Params` | |
| Domain (output) | | `*Projection` |

Enforced by `npm run test:naming`.

---

## Pattern Index

Each pattern has its own detailed document:

### Domain Layer

- [Domain Service](domain/domain-service-pattern.md)
- [Runner](domain/runner-pattern.md)
- [Transaction Script](domain/transaction-script-pattern.md)
- [Aggregator](domain/aggregator-pattern.md)
- [Mapper](domain/mapper-pattern.md)
- [Assembler](domain/assembler-pattern.md)
- [Converter](domain/converter-pattern.md)
- [Comparator](domain/comparator-pattern.md)
- [Validator](domain/validator-pattern.md)
- [Entity](domain/entity-pattern.md)
- [Projection](domain/projection-pattern.md)

### Application Layer

- [Action](application/action-pattern.md)
- [DTO](application/dto-pattern.md)

### Infrastructure Layer

- [Repository](infrastructure/repository-pattern.md)
- [Dispatcher](infrastructure/dispatcher-pattern.md)
- [RemoteCaller](infrastructure/remote-caller-pattern.md)

### Cross-Cutting

- [Registry](registry-pattern.md)
