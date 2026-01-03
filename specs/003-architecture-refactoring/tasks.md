# Architecture Refactoring Tasks

## Task Breakdown

### Phase 1: Domain Naming Fixes

#### Task 1.1: Rename note-dto-to-entity.converter.ts

**Files to modify**:
- `src/notes/domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter.ts`
- `src/notes/domain/transaction-scripts/update-note-TS/__specs__/note-dto-to-entity.converter.spec.ts`

**Steps**:
1. Rename file: `note-dto-to-entity.converter.ts` → `note-params-to-entity.converter.ts`
2. Update class name: `NoteDtoToEntityConverter` → `NoteParamsToEntityConverter`
3. Update parameter type: `UpdateNoteDto` → `UpdateNoteParams` (create this type if needed)
4. Update spec file name and class references
5. Find all imports of this converter and update them
6. Verify the converter is used correctly (it's converting DTO to entity, so "Params" makes sense)

**Note**: The converter currently imports `UpdateNoteDto` from the application layer. According to architecture rules, domain should not depend on application layer. We need to:
- Create `UpdateNoteParams` type in the domain layer
- Update the transaction script to convert DTO to Params before calling converter
- Or move the converter to application layer if it's meant to convert DTOs

**Decision needed**: Should this converter be in domain or application layer?

---

### Phase 2: Service Dependency Fixes

#### Task 2.1: Fix calendar-event.service.ts converter dependency

**File**: `src/calendar-events/domain/services/calendar-event.service.ts`

**Current violation**: Service directly injects `RecurringEventToDomainConverter`

**Steps**:
1. Review `RecurringEventToDomainConverter` usage in the service
2. Move converter usage to a transaction script (likely `GenerateEventInstancesTransactionScript` or create a new one)
3. Update service to remove converter injection
4. Update transaction script to handle the conversion
5. Update module to remove converter from service providers

**Alternative approach**: If the converter is needed at service level, create a mapper that wraps the converter, and inject the mapper into the transaction script instead.

---

### Phase 3: Auth Guard Cross-Domain Fix

#### Task 3.1: Move jwt-auth.guard to shared-kernel

**Files to modify**:
- Move: `src/auth/jwt-auth.guard.ts` → `src/shared-kernel/apps/guards/jwt-auth.guard.ts`
- Update all 16 files that import it

**Steps**:
1. Create directory: `src/shared-kernel/apps/guards/`
2. Move `jwt-auth.guard.ts` to new location
3. Update auth module if it exports the guard
4. Update all imports:
   - `src/calendar-events/apps/actions/*` (7 files)
   - `src/audio/apps/actions/*` (2 files)
   - `src/users/app/controllers/users.controller.ts`
   - `src/time-tracks/apps/actions/*` (5 files)
   - `src/shared-kernel/apps/decorators/protected-action.decorator.ts`
5. Verify auth module still works correctly
6. Run tests to ensure nothing breaks

**Note**: Guards are infrastructure/shared concerns, so moving to shared-kernel makes sense.

---

### Phase 4: Notes ↔ Check-Items Domain Boundary

#### Task 4.1: Create CheckItemAggregator

**File to create**: `src/check-items/domain/aggregators/check-item.aggregator.ts`

**Steps**:
1. Create aggregator file
2. Identify operations needed by notes domain:
   - Finding check items by note ID
   - Creating check items
   - Deleting check items by note ID
   - Any other cross-domain operations
3. Inject necessary transaction scripts and repositories
4. Implement aggregator methods
5. Export aggregator in `check-items.module.ts`

**Example structure**:
```typescript
@Injectable()
export class CheckItemAggregator {
  constructor(
    private readonly checkItemRepository: CheckItemRepository,
    // Add transaction scripts as needed
  ) {}

  async findByNoteId(noteId: number): Promise<CheckItem[]> {
    // Implementation
  }

  async deleteByNoteId(noteId: number): Promise<void> {
    // Implementation
  }
}
```

#### Task 4.2: Update notes domain to use CheckItemAggregator

**Files to modify**:
- `src/notes/infra/repositories/check-items.repository.ts` - Remove or refactor
- `src/notes/domain/entities/notes/note.entity.ts` - Remove direct entity import
- `src/notes/apps/dtos/responses/note.response.dto.ts` - Use projections
- `src/notes/apps/dtos/responses/check-item.response.dto.ts` - Move to check-items domain or use aggregator
- `src/notes/apps/actions/notes/get-note-by-id-action/get-note-by-id.action.ts` - Use aggregator
- `src/notes/test-utils/mock-factories.ts` - Fix tag entity import (wrong domain)

**Steps**:
1. Update `notes.module.ts` to import `CheckItemsModule` and get `CheckItemAggregator`
2. Inject `CheckItemAggregator` into notes service or actions that need it
3. Replace direct entity imports with aggregator calls
4. Update DTOs to use projections instead of entities
5. Fix `mock-factories.ts` - it imports from tags domain, should use TagAggregator or shared types

**Note**: The `check-items.repository.ts` in notes domain suggests tight coupling. We need to:
- Either remove it and use CheckItemAggregator
- Or move it to check-items domain if it's a notes-specific query

#### Task 4.3: Move shared types to shared-kernel

**Steps**:
1. Identify types that need to be shared between notes and check-items
2. Create appropriate types in `src/shared-kernel/domain/types/`
3. Update imports in both domains
4. Ensure types are interfaces/types only, no business logic

---

### Phase 5: Tags ↔ Notes Domain Boundary

#### Task 5.1: Fix tags swagger importing notes DTO

**File**: `src/tags/app/actions/add-tag-to-note-action/swagger/add-tag-to-note.swagger.ts`

**Steps**:
1. Review what the swagger file needs from notes DTO
2. Options:
   - Use NoteAggregator to get note data
   - Move shared DTO parts to shared-kernel
   - Create a projection type in shared-kernel
3. Update swagger file to use the chosen approach
4. Verify swagger documentation still works

---

### Phase 6: Auth ↔ Users Domain Boundary

#### Task 6.1: Create UserAggregator

**File to create**: `src/users/domain/aggregators/user.aggregator.ts`

**Steps**:
1. Review `src/auth/domain/auth.service.ts` to see what user operations it needs
2. Create aggregator with methods like:
   - `findByEmail(email: string): Promise<User | null>`
   - `findById(id: number): Promise<User | null>`
   - Any other operations needed by auth
3. Inject necessary repositories/transaction scripts
4. Export aggregator in `users.module.ts`

#### Task 6.2: Update auth service to use UserAggregator

**File**: `src/auth/domain/auth.service.ts`

**Steps**:
1. Remove direct imports of `UsersService` and `User` entity
2. Inject `UserAggregator` instead
3. Update all user operations to use aggregator
4. Update `auth.module.ts` to import `UsersModule` and get `UserAggregator`
5. Verify authentication still works

---

### Phase 7: Orphaned Files

#### Task 7.1: Review and fix orphaned files

**Files to review**:
1. `src/shared-kernel/test-utils.ts` - Should be used in tests
2. `src/shared-kernel/domain/cross-domain-commands/tags/delete-note-tag-associations.command.ts` - Should be used by tags or notes domain
3. `src/shared-kernel/domain/cross-domain-commands/notes/verify-note-access.command.ts` - Should be used somewhere
4. `src/shared-kernel/domain/cross-domain-commands/notes/get-note-details.command.ts` - Should be used somewhere
5. `src/shared-kernel/domain/cross-domain-commands/check-items/delete-check-items-by-note.command.ts` - Should be used by check-items or notes
6. `src/shared-kernel/apps/decorators/get-auth-user.decorator.ts` - Should be used in actions
7. `src/notes/apps/dtos/requests/update-note-title.dto.ts` - Check if this is used or should be removed
8. `src/check-items/apps/actions/create-check-item/create-check-item.dto.ts` - Check if this is used
9. `src/audio/apps/dtos/responses/audio.response.dto.ts` - Check if this is used

**Steps for each file**:
1. Search codebase for imports/usage
2. If used but not detected: Fix import paths or add usage
3. If not used: Determine if it should be used
4. If should be used: Add usage in appropriate place
5. If not needed: Remove file and update tests

---

### Phase 8: Code Cleanup

#### Task 8.1: Remove unused EventInstance entity and repository

**Issue**: `EventInstance` domain entity and `EventInstanceRepository` are unused dead code. The codebase uses a unified `CalendarEvent` entity that handles both one-time events and recurring event instances (via `recurringEventId` field).

**Files to remove**:
- `src/calendar-events/domain/entities/event-instance.entity.ts`
- `src/calendar-events/infra/entities/event-instance.entity.ts`
- `src/calendar-events/infra/repositories/event-instance.repository.ts`

**Steps**:
1. Verify `EventInstanceRepository` is not registered in `calendar-events.module.ts` (confirmed: it's not)
2. Search codebase for any remaining references to `EventInstance` or `EventInstanceRepository`
3. Remove the domain entity file
4. Remove the infrastructure entity file
5. Remove the repository file
6. Run tests to ensure nothing breaks
7. Consider: These domain entities feel like projections (pure data structures for reading) - may want to reorganize as projections in the future

**Note**: Domain entities (`CalendarEvent`, `RecurringEvent`, etc.) are currently pure TypeScript types used primarily for reading/displaying. Consider if some should be reorganized as projections for specific use cases in the future (not blocking).

---

### Phase 9: Verification

#### Task 9.1: Run architecture checks
```bash
cd backend
npm run test:fitness
```

#### Task 9.2: Run tests
```bash
npm test
```

#### Task 9.3: Manual verification
- Test authentication
- Test calendar events
- Test notes with check items
- Test tags with notes
- Test time tracks

---

## Implementation Checklist

### Quick Wins (Low Risk, High Impact)
- [ ] Task 3.1: Move jwt-auth.guard (affects many files but straightforward)
- [ ] Task 7.1: Fix orphaned files (can be done incrementally)
- [ ] Task 8.1: Remove unused EventInstance code (dead code removal)

### Medium Complexity
- [ ] Task 1.1: Rename converter (requires understanding DTO vs Params)
- [ ] Task 2.1: Fix service converter dependency
- [ ] Task 5.1: Fix tags swagger

### High Complexity (Requires Aggregators)
- [ ] Task 4.1-4.3: Notes ↔ Check-Items boundary
- [ ] Task 6.1-6.2: Auth ↔ Users boundary

---

## Notes and Decisions Needed

1. **Converter location**: Should `NoteDtoToEntityConverter` be in domain or application layer?
   - Current: Domain layer (violates layer dependency rules)
   - Option A: Move to application layer
   - Option B: Create Params type and keep in domain

2. **CheckItemsRepository in notes domain**: Should this exist?
   - Option A: Remove and use CheckItemAggregator
   - Option B: Move to check-items domain if it's notes-specific

3. **Cross-domain commands**: Are these being used? If not, should they be removed or implemented?

4. **DTOs in shared-kernel**: Should response DTOs be shared, or should we use projections/aggregators?

5. **Domain entities as projections**: The calendar-events domain entities (`CalendarEvent`, `RecurringEvent`, etc.) are pure TypeScript types used primarily for reading. Should some be reorganized as projections for specific use cases? (Future improvement, not blocking)

