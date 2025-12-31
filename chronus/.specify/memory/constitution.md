<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (I-VII)
  - Architecture Constraints
  - Development Workflow
  - Governance
Templates requiring updates:
  - ✅ plan-template.md (Constitution Check section references constitution)
  - ✅ spec-template.md (aligned with principles)
  - ✅ tasks-template.md (aligned with principles)
Follow-up TODOs: None
-->

# Chronus Constitution

## Core Principles

### I. Domain-Driven Design (DDD) with Layered Architecture
All modules MUST follow Domain-Driven Design principles with clear separation between Application, Domain, and Infrastructure layers. Domain logic MUST be isolated from infrastructure concerns. Dependencies MUST point inward toward the domain. Each module MUST be organized as a bounded context with its own entities, services, and repositories. Cross-domain communication MUST occur through Aggregators, never through direct entity references.

**Rationale**: DDD ensures business logic remains independent of technical implementation, enabling testability, maintainability, and clear domain boundaries. Layered architecture enforces separation of concerns and dependency direction.

### II. Transaction Scripts Pattern (NON-NEGOTIABLE)
All domain logic MUST be encapsulated in Transaction Scripts. Transaction Scripts are the ONLY place where business rules and domain logic reside. Actions/Controllers MUST call Services, which delegate to Transaction Scripts. Transaction Scripts MUST use Repositories for data access. No business logic in Services, Repositories, or Actions.

**Rationale**: Transaction Scripts centralize domain logic for each feature, ensuring single responsibility, testability, and clear business rule enforcement. This pattern prevents logic leakage into infrastructure or application layers.

### III. Strict TypeScript Typing (NON-NEGOTIABLE)
All code MUST use explicit TypeScript types. The `any` type is FORBIDDEN. All function parameters and return values MUST have declared types. Create specific types for each use case rather than reusing generic types. Use `const` over `function` declarations. Prefer `type` over `interface` declarations.

**Rationale**: Type safety prevents runtime errors, improves IDE support, documents contracts, and enables refactoring confidence. Explicit types serve as living documentation.

### IV. Dependency Injection Rules
Dependencies MUST follow strict hierarchy: Actions → Services → Transaction Scripts → Repositories. Patterns at the same level MUST NOT inject each other. Services orchestrate Transaction Scripts. Transaction Scripts use Repositories and Aggregators. Aggregators provide cross-domain communication. No circular dependencies allowed.

**Rationale**: Clear dependency hierarchy prevents coupling, enables testability through dependency inversion, and maintains architectural boundaries. Same-level injection creates tight coupling and violates separation of concerns.

### V. Testing Discipline
All public functions MUST have unit tests. Tests MUST be placed in `__specs__` folders next to target files. Test subjects MUST be named `target`. Follow Arrange-Act-Assert pattern. Use Jest framework for all testing. E2E tests MUST exist for each API module. Tests MUST be written before or alongside implementation.

**Rationale**: Testing ensures correctness, prevents regressions, documents expected behavior, and enables confident refactoring. Test-first approach catches design issues early.

### VI. Module Structure & File Organization
Each module MUST follow consistent structure: `apps/actions/`, `domain/services/`, `domain/transaction-scripts/`, `domain/aggregators/`, `domain/entities/`, `infra/repositories/`. Each action MUST be in its own folder with DTOs in `dtos/requests/` subfolder. No barrel imports/exports. One export per file.

**Rationale**: Consistent structure enables navigation, reduces cognitive load, and enforces architectural boundaries. Isolated action folders support independent development and testing.

### VII. Domain/Infrastructure Separation
Domain layer MUST contain pure TypeScript classes with NO TypeORM decorators or imports. Infrastructure layer handles ALL TypeORM entities, repositories, and database logic. Domain entities and infrastructure entities MUST be separate. Mapping between domain and infrastructure entities MUST occur in infrastructure layer.

**Rationale**: Separation keeps domain logic testable without database dependencies, enables technology changes without domain impact, and maintains clean architecture principles.

## Architecture Constraints

### Technology Stack
- **Backend**: NestJS framework with TypeORM for persistence
- **Frontend**: React with TypeScript
- **Database**: SQLite (development), with migration support
- **Testing**: Jest for unit and e2e tests
- **Language**: TypeScript 5.1+ with strict mode

### Module Boundaries
- Entities from one domain MUST NOT directly reference entities from another domain
- Cross-domain communication MUST use Aggregators
- Shared entities MUST be placed in `shared-kernel/domain/entities/`
- Join entities for many-to-many relationships MAY be placed in shared-kernel

### Code Quality Standards
- Functions MUST be short (less than 20 instructions)
- Classes MUST be small (less than 200 instructions, less than 10 public methods)
- Use early returns to reduce nesting
- Prefer higher-order functions (map, filter, reduce) over loops
- Use descriptive names (camelCase for variables/functions, PascalCase for classes, kebab-case for files)

## Development Workflow

### Code Review Requirements
All PRs MUST verify compliance with constitution principles. Architecture violations MUST be justified in Complexity Tracking section of implementation plans. Code reviews MUST check dependency injection rules, layer boundaries, and type safety.

### Testing Gates
No feature MAY be merged without:
- Unit tests for all public functions
- E2E tests for API endpoints (if applicable)
- All tests passing
- No `any` types introduced

### Documentation
- JSDoc MUST document all public classes and methods
- README files MUST exist for each module explaining purpose and usage
- Architecture decisions MUST be documented in implementation plans

## Governance

This constitution supersedes all other coding practices and architectural decisions. Amendments require:
1. Documentation of rationale
2. Approval through code review
3. Migration plan for existing code
4. Version bump according to semantic versioning:
   - **MAJOR**: Backward incompatible principle removals or redefinitions
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements

All PRs and reviews MUST verify constitution compliance. Complexity MUST be justified when violating principles. Use `.cursor/rules/` files for runtime development guidance that references this constitution.

**Version**: 1.0.0 | **Ratified**: 2024-12-30 | **Last Amended**: 2024-12-30
