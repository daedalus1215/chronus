# Architecture Refactoring Plan

## Overview

This document outlines the refactoring plan to bring the codebase into compliance with the architecture fitness checks. The violations fall into several categories:

1. **Domain Naming Violations** (2 violations)
2. **Architecture Dependency Violations** (33 violations)
   - Services depending on converters
   - Domain module boundary violations
   - Orphaned files

## Violations Summary

### 1. Domain Naming Violations

**Issue**: Domain layer files contain "Dto" in their names, which violates the naming convention.

**Files to Fix**:
- `src/notes/domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter.ts`
- `src/notes/domain/transaction-scripts/update-note-TS/__specs__/note-dto-to-entity.converter.spec.ts`

**Solution**: Rename to use "Params" or "Projection" instead of "Dto".

### 2. Domain Module Boundary Violations

**Issue**: Domain modules are importing from other domains directly instead of through aggregators/ports.

#### 3.1 Auth Guard Cross-Domain Imports

Multiple actions importing `src/auth/jwt-auth.guard`:
- `src/users/app/controllers/users.controller.ts`
- `src/time-tracks/apps/actions/*` (5 actions)
- `src/audio/apps/actions/*` (2 actions)

**Solution**: Move `jwt-auth.guard` to `shared-kernel` or create a shared auth module.

#### 3.2 Notes Domain Importing Check-Items Domain

**Violations**:
- `src/notes/test-utils/mock-factories.ts` → `src/tags/domain/entities/tag.entity.ts`
- `src/notes/infra/repositories/check-items.repository.ts` → `src/check-items/domain/entities/check-item.entity`
- `src/notes/domain/entities/notes/note.entity.ts` → `src/check-items/domain/entities/check-item.entity`
- `src/notes/apps/dtos/responses/note.response.dto.ts` → `src/check-items/domain/entities/check-item.entity`
- `src/notes/apps/dtos/responses/check-item.response.dto.ts` → `src/check-items/domain/entities/check-item.entity`
- `src/notes/apps/actions/notes/get-note-by-id-action/get-note-by-id.action.ts` → `src/check-items/domain/entities/check-item.entity`

**Solution**: 
- Use CheckItemAggregator for cross-domain access
- Use projections/DTOs instead of direct entity imports
- Move shared types to shared-kernel if needed (discouraged. easier to just naming things after their use-case. Like CreateUserProjection or CreateUserCommand)

#### 3.3 Tags Domain Importing Notes Domain

**Violation**:
- `src/tags/app/actions/add-tag-to-note-action/swagger/add-tag-to-note.swagger.ts` → `src/notes/apps/dtos/responses/note.response.dto`

**Solution**: Create a new DTO that only this usecase depends on called `add-tag-to-note.response.dto`

#### 3.4 Auth Domain Importing Users Domain

**Violations**:
- `src/auth/domain/auth.service.ts` → `src/users/domain/users.service.ts`
- `src/auth/domain/auth.service.ts` → `src/users/domain/entities/user.entity.ts`

**Solution**: 
- Create UserAggregator for user operations
- Use ports for cross-domain communication

### 4. Orphaned Files

**Issue**: Files that are not imported by any other file (violates no-orphans rule).

**Status**: Most are false positives - dependency-cruiser doesn't track event-based dependencies and some dynamic imports.

**Actually Orphaned (Removed)**:
- ✅ `src/check-items/apps/actions/create-check-item/create-check-item.dto.ts` - Duplicate file, removed

**False Positives (Actually Used)**:
- `src/shared-kernel/test-utils.ts` - Used in 14+ test files
- `src/shared-kernel/apps/decorators/get-auth-user.decorator.ts` - Used in 100+ files via decorator
- `src/shared-kernel/domain/cross-domain-commands/*` - Used via event listeners (not tracked by dependency-cruiser)
- `src/notes/apps/dtos/requests/update-note-title.dto.ts` - Used in action and transaction script
- `src/audio/apps/dtos/responses/audio.response.dto.ts` - Used in service and transaction script

**Solution**: These are false positives. The architecture checker has limitations with event-based dependencies and decorators. No action needed.

## Refactoring Tasks

### Phase 1: Domain Naming Fixes

- [ ] **Task 1.1**: Rename `note-dto-to-entity.converter.ts` to use "Params" or "Projection"
  - Rename file: `note-dto-to-entity.converter.ts` → `note-params-to-entity.converter.ts` (or appropriate name [use-case in name is good])
  - Update class name if needed
  - Update imports in consuming files
  - Update spec file name and references

### Phase 2: Auth Guard Cross-Domain Fix

- [ ] **Task 2.1**: Move jwt-auth.guard to shared-kernel
  - Move `src/auth/jwt-auth.guard.ts` to `src/shared-kernel/apps/guards/jwt-auth.guard.ts`
  - Update all imports across domains
  - Update auth module exports if needed
  - Verify all actions can still use the guard

### Phase 3: Notes ↔ Check-Items Domain Boundary

- [ ] **Task 4.1**: Create CheckItemAggregator
  - Create `src/check-items/domain/aggregators/check-item.aggregator.ts`
  - Add methods for operations needed by notes domain
  - Export aggregator in check-items module

- [ ] **Task 4.2**: Update notes domain to use CheckItemAggregator
  - Update `src/notes/infra/repositories/check-items.repository.ts` to use aggregator
  - Update `src/notes/domain/entities/notes/note.entity.ts` to remove direct entity import
  - Update DTOs to use projections instead of entities
  - Update actions to use aggregator

- [ ] **Task 4.3**: Move shared types to shared-kernel
  - Identify types that need to be shared
  - Move to `src/shared-kernel/domain/types/`
  - Update imports

### Phase 4: Tags ↔ Notes Domain Boundary

- [ ] **Task 5.1**: Fix tags swagger importing notes DTO
  - Review `add-tag-to-note.swagger.ts`
  - Use NoteAggregator or move shared DTO to shared-kernel
  - Update swagger file

### Phase 5: Auth ↔ Users Domain Boundary

- [ ] **Task 6.1**: Create UserAggregator
  - Create `src/users/domain/aggregators/user.aggregator.ts`
  - Add methods for user operations needed by auth
  - Export aggregator in users module

- [ ] **Task 6.2**: Update auth service to use UserAggregator
  - Update `src/auth/domain/auth.service.ts` to use UserAggregator
  - Remove direct imports of users service and entity
  - Update auth module to import users aggregator

### Phase 6: Orphaned Files

- [ ] **Task 7.1**: Review and fix orphaned files
  - For each orphaned file:
    - Determine if it should be used somewhere
    - If yes: Add import and usage
    - If no: Remove the file
  - Update tests if files are removed

### Phase 7: Verification

- [ ] **Task 7.1**: Run architecture checks
  - Run `npm run test:fitness`
  - Verify all violations are resolved
  - Fix any remaining issues

- [ ] **Task 7.2**: Run tests
  - Run `npm test` to ensure no regressions
  - Fix any broken tests

- [ ] **Task 7.3**: Manual verification
  - Test affected features manually
  - Verify cross-domain operations work correctly

## Implementation Order

1. **Start with naming fixes** (Phase 1) - Simple, low risk
2. **Move auth guard** (Phase 2) - Affects many files but straightforward
3. **Fix domain boundaries** (Phases 3-5) - Most complex, requires aggregators
4. **Clean up orphans** (Phase 6) - Can be done in parallel
5. **Verify everything** (Phase 7) - Final validation

## Notes

- All aggregators should follow the pattern defined in the architecture rules
- When moving files to shared-kernel, ensure they're truly shared infrastructure
- Keep domain boundaries strict - use aggregators for all cross-domain communication
- Update tests as you refactor to ensure nothing breaks

