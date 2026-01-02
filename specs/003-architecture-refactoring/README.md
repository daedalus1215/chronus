# Architecture Refactoring Specification

## Overview

This specification documents the plan to refactor the codebase to comply with all architecture fitness checks. The refactoring addresses 35 violations across naming conventions, dependency rules, and domain boundaries.

## Quick Stats

- **Total Violations**: 35
  - Domain Naming: 2
  - Architecture Dependencies: 33
- **Phases**: 9
- **Estimated Complexity**: Medium to High

## Documents

1. **[refactoring-plan.md](./refactoring-plan.md)** - High-level overview and strategy
2. **[tasks.md](./tasks.md)** - Detailed task breakdown with implementation steps

## Violation Categories

### 1. Domain Naming (2 violations)
- Files with "Dto" in domain layer
- **Fix**: Rename to use "Params" or "Projection"

### 2. Service Dependencies (1 violation)
- Service directly depending on converter
- **Fix**: Move converter usage to transaction script

### 3. Domain Boundaries (30 violations)
- Cross-domain imports without aggregators
- Auth guard used across domains
- Direct entity imports between domains
- **Fix**: Create aggregators, move shared code to shared-kernel

### 4. Orphaned Files (9 violations)
- Files not imported anywhere
- **Fix**: Use them or remove them

## Recommended Implementation Order

1. **Phase 3**: Move jwt-auth.guard (quick win, affects many files)
2. **Phase 1**: Fix domain naming (simple rename)
3. **Phase 2**: Fix service dependencies (clear violation)
4. **Phase 7**: Clean up orphans (can be done incrementally)
5. **Phase 8**: Code cleanup - remove dead code (EventInstance cleanup)
6. **Phase 4-6**: Fix domain boundaries (requires aggregators - most complex)

## Key Principles

1. **Domain boundaries**: Use aggregators for all cross-domain communication
2. **Layer dependencies**: Domain should not depend on application layer
3. **Naming**: Domain uses "Params", "Command", "Projection" - not "Dto"
4. **Shared code**: Guards, decorators, and utilities go in shared-kernel

## Verification

After each phase:
```bash
cd backend
npm run test:fitness  # Architecture checks
npm test              # Unit tests
```

## Getting Started

1. Read [refactoring-plan.md](./refactoring-plan.md) for strategy
2. Review [tasks.md](./tasks.md) for detailed steps
3. Start with Phase 3 (jwt-auth.guard) for a quick win
4. Work through phases incrementally
5. Verify after each phase

## Questions or Issues?

- Review architecture rules in `backend/rules/`
- Check existing aggregators for patterns
- Consult the architecture documentation in workspace rules

