---
tags: [architecture, philosophy, paradigms, ddd, solid]
author: Larry Adams
created: 2026-07-03
modified: 2026-07-03
---

# Design Philosophy

Read this before the individual pattern pages. It explains *why* the patterns look the way they do — the intellectual lineage, the specific choices made from each source, and the four properties the whole system is designed to produce.

---

## The premise: three paradigms, used together

Software development has produced three distinct ways of thinking about code. None of them is complete on its own. Our codebase draws deliberately from all three.

### The timeline

| Year | Event |
| ---- | ----- |
| 1930 | **Functional Paradigm** — Alonzo Church's lambda calculus. First-class functions, immutability. |
| 1967 | **OOP Paradigm** — Simula and Smalltalk introduce objects, encapsulation, and inheritance. |
| 1968–1979 | **Structured Paradigm** — Dijkstra and Larry Constantine. Cohesion, coupling, top-down design. |
| 1970 | **Functional Paradigm declines** — OOP dominates as industry scales up. |
| 1990 | **Functional Paradigm reborn** — immutability and first-class functions re-emerge as answers to concurrency problems. |
| 1994 | **Design Patterns** — Gang of Four. Named, reusable solutions to recurring OO problems. |
| 2002 | **Patterns for Enterprise Applications** — Martin Fowler. Transaction Script, Domain Model, Table Module. |
| 2003 | **Domain-Driven Design** — Eric Evans. Bounded contexts, ubiquitous language, domain isolation. |
| 2004 | **SOLID principles** — Uncle Bob. Five principles for maintainable OO design. |
| 2005 | **Hexagonal Architecture** — Alistair Cockburn. Ports and adapters; the domain does not know about infrastructure. |
| 2008 | **Onion Architecture** — Jeffrey Palermo. Layered folder structure that enforces dependency direction. |

The second half of this timeline — everything from 1990 onward — is the **refinement era**. Each entry is a response to scale and maintainability problems encountered by teams working with the earlier paradigms at enterprise scale. Our architecture sits at the end of that refinement arc.

---

## What each paradigm contributes

### From Functional

- **Immutability** — prefer `const` over `let`; do not reassign variables. Methods that look like transformations should be transformations.
- **First-class functions** — use `map`, `filter`, `reduce` over imperative loops. This opens the door to concurrent execution of independent work.

### From Structured

- **Cohesion** — how closely related the functions and data within a single module are. We maximize cohesion by colocating things that change together (common closure principle).
- **Top-down design** — a clear hierarchy of responsibility, from orchestrators down to primitives. The dependency hierarchy in our patterns is structured design applied directly.
- **Awareness of coupling** — the degree of dependency between modules. The layer boundary rules and port/adapter pattern exist specifically to manage coupling.

### From OOP

- **Classes** — the unit of injectable, testable behavior. Every pattern (Transaction Script, Assembler, Converter, etc.) is a class.
- **SOLID principles:**
  - **S — Single Responsibility:** one reason to change per class. Each pattern handles exactly one concern.
  - **O — Open/Closed:** extend through composition, not by modifying existing classes. New behavior via new Transaction Scripts, not by expanding existing ones.
  - **L — Liskov Substitution:** subtypes are interchangeable with their base type. Ports (interfaces) are consumed via token injection so implementations can be swapped.
  - **I — Interface Segregation:** focused interfaces, not fat ones. Each Aggregator port exposes only the methods its consumer needs.
  - **D — Dependency Inversion:** depend on abstractions, not concretions. Domain code injects ports; infrastructure implements them.

---

## What each architecture contributes

### From Domain-Driven Design (Eric Evans)

- **Bounded contexts** — clear domain boundaries. Code in one domain does not directly reference entities or classes from another.
- **Domains and sub-domains** — Core (competitive advantage), Support (enables core), Generic (shared across all).
- **Ubiquitous language** — class names, method names, and file names use the domain's own vocabulary. `FetchCaseDetailTS` means something to a domain expert, not just a developer.

### From Transaction Scripts (Fowler's *Patterns for Enterprise Apps*)

The Fowler complexity chart shows that Transaction Scripts are the right choice until domain logic is complex enough to justify a full Domain Model:

```
Effort │         Transaction Script ╱
to     │                           ╱  Table Module
Enhance│                     ╱╲   ╱
       │                    ╱  ╲ ╱
       │         Domain Model   ╱
       └─────────────────────────────
              Complexity of Domain Logic
```

We adopt the Transaction Script pattern **within** a DDD context:
- **Top-down design** — the hierarchy (Action → Service → Transaction Script → Repository) is structured design applied to OOP classes.
- **Use case with a name** — every Transaction Script class name is a verb phrase: `FetchCaseDetailTS`, `UploadCompleteRecordFileTS`. The name is the use case.
- **Verb-named classes** — class names describe what happens, not what the class is.

### From Onion Architecture (Palermo)

- **Folder structure** — the `application/`, `domain/`, `infrastructure/` folder layout makes layer membership visible without reading any code.
- **Composition of class patterns** — each folder level has a defined set of allowed patterns. Infrastructure can depend on domain; domain cannot depend on infrastructure or application.

### From Hexagonal Architecture (Cockburn)

- **Domain protection** — the domain layer never imports from infrastructure or framework packages. It defines ports (TypeScript types + Symbol tokens); infrastructure implements them.
- **Vendor lock-in prevention** — swapping SQS for RabbitMQ, or TypeORM for Prisma, requires changing infrastructure classes only. The domain is untouched.

---

## The synthesis: what we actually build

> Our system brings together all three paradigms to produce a modular, scalable architecture designed for clarity and maintainability.

| Goal | What it means |
| ---- | ------------- |
| **Modular** | We create modules for our domains and sub-domains. Each module is independently deployable. |
| **Scalable** | Modules can be extracted into microservices and scaled independently. |
| **Clarity** | Conventional patterns (Patterns for Enterprise Applications) and SOLID principles are used so a reader can identify what phase of the process they are looking at. The pattern name is the intent. |
| **Maintainability** | All three paradigms and SOLID principles work together. Immutability reduces state bugs. Cohesion keeps related things together. SOLID keeps each class focused and replaceable. |

---

## The layered architecture at a glance

### Core request flow (happy path)

```
User
  │ send request
  ▼
Action                  (application layer — HTTP endpoint)
  │
  ▼
Service                 (domain layer — orchestration)
  ├── Create User TS ──▶ Repository (create user) ─┐
  ├── Delete User TS ──▶ Repository (delete user) ──┤──▶ Aurora DB
  └── Update User TS ──▶ Repository (update user) ─┘
```

Each Transaction Script handles one use case. The Service orchestrates across them. The Repository owns the database call.

### Full system picture (with external systems)

```
Foreign System ──▶ queue broker
                        │
           ┌────────────┘
┌─ APPLICATION ──────────────────────────────────────────────────────┐
│  SQS Listener    Action    Webhook                                  │
│  (queue events)  (HTTP)    (backend HTTP)                          │
│                                           events  Guards           │
│                                           dtos    decorators       │
└──────────────────────┬─────────────────────────────────────────────┘
                       │
┌─ DOMAIN ─────────────▼─────────────────────────────────────────────┐
│  Service           assemblers                                       │
│    │               entities                                         │
│    ▼                                                                │
│  TransactionScript ──▶ Converter                                   │
└──────────────────────┬─────────────────────────────────────────────┘
                       │
┌─ INFRASTRUCTURE ──────▼────────────────────────────────────────────┐
│  Database Repository ──▶ Aurora DB                                 │
│  S3 Repository       ──▶ Amazon S3 Glacier                         │
│  Adapter             ──▶ Foreign Service                           │
│  Producer            ──▶ Queue Broker ──▶ Foreign System           │
└────────────────────────────────────────────────────────────────────┘
```

The application layer receives all inbound signals (HTTP, queue, webhook). The domain layer contains all business logic, isolated from every framework and infrastructure concern. The infrastructure layer connects domain ports to the real world.

---

## How the paradigms map to the pattern hierarchy

| Paradigm | Manifests as |
| -------- | ------------ |
| **Structured** | The top-down hierarchy (Action → Service → TS → Mapper → Assembler → Converter → Repository). Each level has one responsibility. |
| **Functional** | `const` over `let` inside Transaction Scripts. `map`/`filter` over loops. Stateless Converters and Comparators. Immutable parameter objects (Commands, Params). |
| **OOP** | Every pattern is an `@Injectable()` class. SOLID principles govern what each class can inject and what it cannot. Ports + Symbol tokens implement Dependency Inversion. |

---

## Related

- [[dependency-hierarchy]] — the full injection rules that flow from this philosophy
- [[README]] — index of all pattern pages
- [[domain/transaction-script-pattern]] — where structured + functional thinking is most visible
- [[infrastructure/dispatcher-pattern]] — where hexagonal architecture (ports) is most visible
