---
tags: [spec, cleanup, time-tracks, ddd, hexagonal]
author: AI Review
parent: time-track-page-spec
status: draft
---

# Time-Tracks Module Cleanup Spec

## Context

Code review of the `time-track-page` branch identified several DDD/Hexagonal architecture pattern violations that need cleanup before merge. This spec provides step-by-step instructions for another AI to implement the fixes.

**Reference Patterns:**
- `~/Nextcloud/nebechaunezzer/programming/planet-depos/larry-adams/patterns/dependency-hierarchy.md`
- `~/Nextcloud/nebechaunezzer/programming/planet-depos/larry-adams/patterns/application/action-pattern.md`
- `~/Nextcloud/nebechaunezzer/programming/planet-depos/larry-adams/patterns/domain/transaction-script-pattern.md`

---

## Task 1: Fix Critical Syntax Error (P0)

**File:** `backend/src/time-tracks/domain/services/time-track-service/time-track.service.ts`

**Action:** Remove stray character on line 115

**Current:**
```typescript
  async getStreak(userId: number, date?: string): Promise<StreakResponseDto> {
    return this.getStreakTS.apply(userId, date);
  }
  i;  // <-- DELETE THIS LINE

  async getNotesByYear(
```

**Expected:**
```typescript
  async getStreak(userId: number, date?: string): Promise<StreakResponseDto> {
    return this.getStreakTS.apply(userId, date);
  }

  async getNotesByYear(
```

---

## Task 2: Rename Actions (Get → Fetch)

**Pattern Rule:** GET handlers must use `Fetch` prefix, not `Get`, to avoid confusion with `@Get()` decorator.

### 2.1 Rename Files and Classes

| Current File | New File | Current Class | New Class |
|--------------|----------|---------------|-----------|
| `get-time-tracks-by-date-range-action/get-time-tracks-by-date-range.action.ts` | `fetch-time-tracks-by-date-range-action/fetch-time-tracks-by-date-range.action.ts` | `GetTimeTracksByDateRangeAction` | `FetchTimeTracksByDateRangeAction` |
| `get-time-tracks-by-note-id-action/get-time-tracks-by-note-id.action.ts` | `fetch-time-tracks-by-note-id-action/fetch-time-tracks-by-note-id.action.ts` | `GetTimeTracksByNoteIdAction` | `FetchTimeTracksByNoteIdAction` |
| `get-time-tracks-total-by-note-id-action/get-time-tracks-total-by-note-id.action.ts` | `fetch-time-tracks-total-by-note-id-action/fetch-time-tracks-total-by-note-id.action.ts` | `GetTimeTracksTotalByNoteIdAction` | `FetchTimeTracksTotalByNoteIdAction` |
| `get-daily-time-tracks-aggregation-action/get-daily-time-tracks-aggregation.action.ts` | `fetch-daily-time-tracks-aggregation-action/fetch-daily-time-tracks-aggregation.action.ts` | `GetDailyTimeTracksAction` | `FetchDailyTimeTracksAction` |
| `get-weekly-most-active-note-action/get-weekly-most-active-note.action.ts` | `fetch-weekly-most-active-note-action/fetch-weekly-most-active-note.action.ts` | `GetWeeklyMostActiveNoteAction` | `FetchWeeklyMostActiveNoteAction` |
| `get-weekly-trend-action/get-weekly-trend.action.ts` | `fetch-weekly-trend-action/fetch-weekly-trend.action.ts` | `GetWeeklyTrendAction` | `FetchWeeklyTrendAction` |
| `get-streak-action/get-streak.action.ts` | `fetch-streak-action/fetch-streak.action.ts` | `GetStreakAction` | `FetchStreakAction` |
| `get-notes-by-year-action/get-notes-by-year.action.ts` | `fetch-notes-by-year-action/fetch-notes-by-year.action.ts` | `GetNotesByYearAction` | `FetchNotesByYearAction` |

### 2.2 Update Module Imports

**File:** `backend/src/time-tracks/time-tracks.module.ts`

Update all controller imports and class names to match new names.

---

## Task 3: Fix Domain Layer DTO Usage

**Pattern Rule:** Domain layer must not use "Dto" in type names. Use `*Projection` for outputs.

### 3.1 Create Projection Types

**New File:** `backend/src/time-tracks/domain/projections/time-track.projections.ts`

```typescript
export type TimeTrackAggregationProjection = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

export type WeeklyTrendProjection = {
  trend: Array<{ date: string; totalMinutes: number }>;
  weeklyTotal: number;
};

export type StreakProjection = {
  currentStreak: number;
  longestStreak: number;
};

export type NotesByYearProjection = {
  years: Array<{
    year: number;
    notes: Array<{
      noteId: number;
      noteName: string;
      firstDate: string;
      lastDate: string;
      totalTimeMinutes: number;
      dateCount: number;
      tags: string[];
    }>;
  }>;
};

export type TimeTrackWithNoteProjection = {
  id: number;
  noteId: number;
  noteName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyMostActiveNoteProjection = {
  noteId: number;
  totalTimeMinutes: number;
  weekStartDate: string;
  weekEndDate: string;
  noteName: string;
} | null;
```

### 3.2 Update TimeTrackService Return Types

**File:** `backend/src/time-tracks/domain/services/time-track-service/time-track.service.ts`

Replace DTO return types with Projection types:

```typescript
// BEFORE:
async getWeeklyTrend(userId: number, date?: string): Promise<WeeklyTrendResponseDto>
async getStreak(userId: number, date?: string): Promise<StreakResponseDto>
async getNotesByYear(command: GetNotesByYearCommand): Promise<NotesByYearResponseDto>
async getTimeTracksByDateRange(command: GetTimeTracksByDateRangeCommand): Promise<TimeTrackWithNoteResponse[]>

// AFTER:
async getWeeklyTrend(userId: number, date?: string): Promise<WeeklyTrendProjection>
async getStreak(userId: number, date?: string): Promise<StreakProjection>
async getNotesByYear(command: GetNotesByYearCommand): Promise<NotesByYearProjection>
async getTimeTracksByDateRange(command: GetTimeTracksByDateRangeCommand): Promise<TimeTrackWithNoteProjection[]>
```

### 3.3 Update Actions to Convert Projections to DTOs

Actions receive Projections from Service and convert to DTOs for HTTP response.

Example for `FetchWeeklyTrendAction`:

```typescript
@Get('weekly-trend')
@ProtectedAction(FetchWeeklyTrendSwagger)
async apply(
  @Query('date') date: string,
  @GetAuthUser() user: AuthUser
): Promise<WeeklyTrendResponseDto> {
  const projection = await this.service.getWeeklyTrend(user.userId, date);
  return new WeeklyTrendResponseDto(projection);
}
```

---

## Task 4: Fix Action Directly Injecting Transaction Script

**File:** `backend/src/time-tracks/apps/actions/update-time-track-note-action/update-time-track-note.action.ts`

**Pattern Rule:** Actions must inject Domain Services, not Transaction Scripts directly.

### 4.1 Add Method to TimeTrackService

**File:** `backend/src/time-tracks/domain/services/time-track-service/time-track.service.ts`

Add new method:

```typescript
async updateTimeTrackNote(
  id: number,
  userId: number,
  payload: UpdateTimeTrackPayload
): Promise<TimeTrackProjection> {
  return this.updateTimeTrackNoteTS.apply(id, userId, payload);
}
```

(Define `TimeTrackProjection` in projections file)

### 4.2 Update Action to Use Service

**File:** `backend/src/time-tracks/apps/actions/update-time-track-note-action/update-time-track-note.action.ts`

**Current:**
```typescript
@Controller('time-tracks')
export class UpdateTimeTrackNoteAction {
  constructor(
    private readonly updateNoteTS: UpdateTimeTrackNoteTransactionScript
  ) {}

  @Patch(':id')
  @ProtectedAction(UpdateTimeTrackNoteSwagger)
  async execute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimeTrackDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<TimeTrackResponseDto> {
    return this.updateNoteTS.apply(id, authUser.userId, dto);
  }
}
```

**Expected:**
```typescript
@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class UpdateTimeTrackNoteAction {
  constructor(
    private readonly timeTrackService: TimeTrackService
  ) {}

  @Patch(':id')
  @ProtectedAction(UpdateTimeTrackNoteSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimeTrackDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<TimeTrackResponseDto> {
    const projection = await this.timeTrackService.updateTimeTrackNote(id, authUser.userId, dto);
    return new TimeTrackResponseDto(projection);
  }
}
```

**Notes:**
- Method name changed from `execute` to `apply` (consistency with other Actions)
- Added missing decorators: `@UseGuards(JwtAuthGuard)`, `@ApiTags`, `@ApiBearerAuth`
- Now converts Projection to DTO

---

## Task 5: Fix Transaction Scripts Returning DTOs

**Pattern Rule:** Transaction Scripts return domain projections, not DTOs.

### 5.1 Update CreateTimeTrackTransactionScript

**File:** `backend/src/time-tracks/domain/transaction-scripts/create-time-track-TS/create-time-track.transaction.script.ts`

**Current:**
```typescript
async apply(command: CreateTimeTrackCommand): Promise<TimeTrackResponseDto> {
  const timeTrack = await this.timeTrackRepository.create({
    ...command,
    date: command.date,
  });
  return new TimeTrackResponseDto(timeTrack);
}
```

**Expected:**
```typescript
async apply(command: CreateTimeTrackCommand): Promise<TimeTrack> {
  return this.timeTrackRepository.create({
    ...command,
    date: command.date,
  });
}
```

Then update `TimeTrackService.createTimeTrack` to convert entity to projection.

### 5.2 Update UpdateTimeTrackNoteTransactionScript

**File:** `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note.transaction.script.ts`

**Current:**
```typescript
async apply(
  id: number,
  userId: number,
  payload: UpdateTimeTrackPayload
): Promise<TimeTrackResponseDto> {
  const updates = this.payloadConverter.apply(payload);
  const updated = await this.timeTrackRepository.updateByIdAndUserId(id, userId, updates);
  if (!updated) {
    throw new NotFoundException('Time track not found or not owned by user');
  }
  return new TimeTrackResponseDto(updated);
}
```

**Expected:**
```typescript
async apply(
  id: number,
  userId: number,
  payload: UpdateTimeTrackPayload
): Promise<TimeTrack> {
  const updates = this.payloadConverter.apply(payload);
  const updated = await this.timeTrackRepository.updateByIdAndUserId(id, userId, updates);
  if (!updated) {
    throw new NotFoundException('Time track not found or not owned by user');
  }
  return updated;
}
```

---

## Task 6: Fix Converter Colocation

**Pattern Rule:** Converters live next to the Transaction Script that consumes them (functional cohesion).

### 6.1 Move Converter

**Current:** `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note.converter.ts`

**New Location:** `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note-TS/update-time-track-note.converter.ts`

### 6.2 Create TS Folder Structure

```
domain/transaction-scripts/
  update-time-track-note-TS/
    update-time-track-note.transaction.script.ts
    update-time-track-note.converter.ts
    __specs__/
      update-time-track-note.transaction.script.spec.ts
```

### 6.3 Update Imports

Update `time-tracks.module.ts` and any files importing the converter.

---

## Verification Checklist

After implementing all tasks, verify:

- [ ] `npm run build` compiles without errors
- [ ] `npm run test` passes
- [ ] `npm run test:naming` passes (no DTOs in domain layer)
- [ ] No Action classes start with "Get" (all use "Fetch")
- [ ] No Action directly injects a Transaction Script
- [ ] No Transaction Script returns a DTO
- [ ] All Converters are colocated with their consuming Transaction Script

---

## File Inventory

### Files to Modify
1. `backend/src/time-tracks/domain/services/time-track-service/time-track.service.ts`
2. `backend/src/time-tracks/time-tracks.module.ts`
3. `backend/src/time-tracks/apps/actions/update-time-track-note-action/update-time-track-note.action.ts`
4. `backend/src/time-tracks/domain/transaction-scripts/create-time-track-TS/create-time-track.transaction.script.ts`
5. `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note.transaction.script.ts`
6. All 8 Action files (rename + update content)

### Files to Create
1. `backend/src/time-tracks/domain/projections/time-track.projections.ts`
2. `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note-TS/` folder structure

### Files to Move
1. `backend/src/time-tracks/domain/transaction-scripts/update-time-track-note.converter.ts` → `update-time-track-note-TS/`

---

## Anti-Patterns to Avoid

1. **Don't** inject Transaction Scripts into other Transaction Scripts
2. **Don't** import DTOs into domain layer files
3. **Don't** use "Get" prefix for Action class names
4. **Don't** leave Converters at the same level as Transaction Scripts
5. **Don't** return DTOs from Domain Services or Transaction Scripts
6. **Don't** use `!important` in CSS Modules (use proper specificity or MUI's sx prop instead)

---

## Task 7: Remove `!important` from CSS Modules

**Context:** Found 16 CSS files using `!important` to override MUI styles. This is an anti-pattern in CSS Modules.

**Why `!important` is problematic:**
1. CSS Modules already provide scoped, specific selectors
2. Using `!important` breaks the cascade and makes styles hard to maintain
3. It's a sign of fighting MUI's styling system instead of working with it
4. Makes responsive overrides difficult (notice the media queries also need `!important`)

### 7.1 Files to Clean

| File | !important Count |
|------|------------------|
| `TimeEntryPage.module.css` | 17 |
| `SummaryStats.module.css` | 11 |
| `TimeEntryDataGrid.module.css` | TBD |
| `DateRangePicker.module.css` | TBD |
| `QuickAddRow.module.css` | TBD |
| `ExplorerPage.module.css` | TBD |
| `ExplorerTree.module.css` | TBD |
| `FolderTree.module.css` | TBD |
| `NotesBrowser.module.css` | TBD |
| `SearchPage.module.css` | TBD |
| `ActivityPage.module.css` | TBD |
| `WeeklyTrendChart.module.css` | TBD |
| `DesktopSidebar.module.css` | TBD |
| `PersistentAudioPlayer.module.css` | TBD |
| `TagActionGrid.module.css` | TBD |
| `NoteActionGrid.module.css` | TBD |

### 7.2 Recommended Approaches

**Option A: Use MUI's `sx` prop (Preferred for component-level styles)**

Instead of:
```css
.title {
  font-weight: 700 !important;
  color: var(--color-text) !important;
}
```

Use:
```tsx
<Typography sx={{ 
  fontWeight: 700, 
  color: 'var(--color-text)' 
}}>
```

**Option B: Use `styled()` API (Preferred for reusable component variants)**

```tsx
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: 'var(--color-text)',
  marginBottom: '0.25rem',
}));
```

**Option C: Increase CSS specificity naturally**

Instead of:
```css
.card {
  background-color: var(--color-bg-elevated) !important;
}
```

Use:
```css
/* Target the MuiPaper-root specifically */
.card.MuiPaper-root {
  background-color: var(--color-bg-elevated);
}

/* Or use a parent wrapper */
.container .card {
  background-color: var(--color-bg-elevated);
}
```

**Option D: Use CSS Custom Properties that MUI respects**

Configure MUI theme to use your CSS variables instead of fighting with !important.

### 7.3 Example Refactor: SummaryStats.module.css

**Current:**
```css
.card {
  background-color: var(--color-bg-elevated) !important;
  color: var(--color-text) !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 12px !important;
  box-shadow: var(--elevation-2) !important;
}

.label {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  color: var(--color-text-secondary) !important;
}
```

**Recommended (Option C - CSS Module approach):**
```css
/* Use class chaining for specificity */
.card.card {
  background-color: var(--color-bg-elevated);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  box-shadow: var(--elevation-2);
}

.label.label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
```

Or **(Option B - styled component approach):**

Create `SummaryStats.tsx`:
```tsx
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export const StatCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 1.25rem',
  backgroundColor: 'var(--color-bg-elevated)',
  color: 'var(--color-text)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '12px',
  boxShadow: 'var(--elevation-2)',
  transition: 'transform 0.2s var(--ease-out, ease), box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    boxShadow: 'var(--elevation-3)',
  },
}));

export const StatLabel = styled(Typography)({
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
});
```

### 7.4 Priority Order for CSS Cleanup

1. **TimeEntryPage components** (the new code in this branch)
   - `TimeEntryPage.module.css`
   - `SummaryStats.module.css`
   - `TimeEntryDataGrid.module.css`
   - `DateRangePicker.module.css`
   - `QuickAddRow.module.css`

2. **Other files** (if time permits, or create follow-up task)

---

*Generated from code review of time-track-page branch*
