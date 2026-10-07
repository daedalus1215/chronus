# Frontend — React + Tailwind v4 + shadcn/ui

## Commands

```bash
cd frontend
npm run dev          # Vite dev server
npm run build        # production build
npm run preview      # preview production build locally
```

## Styling rules

The app was fully migrated off MUI to **Tailwind v4 + shadcn/ui** (see
`MIGRATION_PROGRESS.md` for the migration history if you need the "why" behind
a particular pattern).

1. **Tailwind utility classes** for layout, spacing, flex/grid, and one-off
   styling directly in JSX (`className="flex items-center gap-2 px-3 py-2"`).
2. **shadcn/ui primitives** from `src/components/ui/` (Button, Dialog, Input,
   Checkbox, Alert, Tooltip, ToggleGroup, DropdownMenu, Textarea, Select,
   etc.) for interactive components — don't hand-roll a primitive shadcn
   already provides. Add a new one with `npx shadcn@latest add <component>`;
   it lands in `src/components/ui/` and is yours to edit freely.
3. **CSS Modules** (`.module.css`) co-located with the component, kept only
   for rules Tailwind utilities don't comfortably express: scrollbar
   hiding/theming, `:global()` overrides, custom `@keyframes`, or styling a
   raw native element (e.g. an autosizing `<textarea>`) that a bare className
   list would make unreadable. Prefer Tailwind first; reach for a CSS Module
   when the alternative is a wall of arbitrary-value utility classes.
4. **`cn()`** (from `src/lib/utils.ts`, backed by `clsx` + `tailwind-merge`)
   for conditionally merging Tailwind classes, and for combining a CSS
   Module class with a Tailwind className on the same element.
5. **Icons**: `lucide-react`. Size via `className="size-4"` etc., not a
   `fontSize` prop.
6. Don't mix MUI patterns back in — there is no MUI left in the app
   (`@mui/*`, `@emotion/*` are not installed). If you're reaching for `sx`,
   `Box`, or `Typography`, you want a `<div>`/Tailwind classes instead.

## Theme

Light and dark modes, independent of Tailwind's own dark-mode story — this
app does NOT use Tailwind's `dark:` variant; theme switching is driven by a
`data-theme` attribute instead.

- `src/contexts/ThemeModeContext.tsx` — `ThemeModeProvider` + `useThemeMode()`. Modes: `'light' | 'dark' | 'system'` (system follows `prefers-color-scheme`, live). The selection persists under `STORAGE_KEYS.APPEARANCE.THEME_MODE`; the resolved mode is applied as `data-theme` on `<html>`. A pre-paint script in `index.html` applies the saved mode before React mounts (no flash).
- `src/styles/global.scss` — design tokens as CSS custom properties (OKLCH-based, shadcn "new-york" convention): `:root` holds light-mode values, `[data-theme='dark']` holds dark-mode values. Always consume tokens (`var(--background)`, `var(--primary)`, `var(--glass-*)`, `var(--elevation-*)`, …) — never hardcode hex/rgba in CSS or Tailwind arbitrary values.
- `src/styles/tailwind.css` — maps those same CSS vars into Tailwind's `--color-*` namespace via `@theme inline`, so `bg-background`, `text-primary`, `border-border`, etc. all resolve to the tokens above. One token is split on purpose: `--accent` (the app's vivid brand purple, consumed by many CSS Modules) stays distinct from shadcn's `--color-accent` (a subtle hover surface), which is aliased to `--ui-accent` instead — don't collapse the two.
- Entry points: `ThemeToggleButton` in the app header (quick switch) and Settings → Appearance (Light / Dark / System).

## Routing

Routes are registered in `src/App.tsx` using `react-router-dom` `<Routes>` / `<Route>`. Route constants live in `src/constants/routes.ts`. Authenticated routes are wrapped in `<AuthenticatedLayout>`.

## Data fetching

Use **React Query** (`@tanstack/react-query`). Hooks live either in `src/hooks/` (shared) or co-located in `src/pages/{PageName}/hooks/` (page-specific).

Pattern:

```typescript
import { useQuery } from '@tanstack/react-query';

export const useMyData = () => {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: fetchMyData,
  });
};
```

API request functions live in `src/api/requests/`. The Axios instance with interceptors is in `src/api/axios.interceptor.ts` (auto-prefixes `/api`, attaches JWT from `localStorage`).

## Worked example 1: a page with a CSS Module

Use a CSS Module when a page's chrome needs responsive rules (here, a
`max-width` breakpoint) that would otherwise be a long arbitrary-value
Tailwind class list.

### Page component (`src/pages/YearlyNotesPage/YearlyNotesPage.tsx`)

```tsx
import React from 'react';
import { YearlyNotesTimeline } from './components/YearlyNotesTimeline/YearlyNotesTimeline';
import { useNotesByYear } from './hooks/useNotesByYear';
import styles from './YearlyNotesPage.module.css';

export const YearlyNotesPage: React.FC = () => {
  const { data, isLoading, error } = useNotesByYear();

  return (
    <div className={styles.yearlyNotesPage}>
      <div className={styles.header}>
        <div className={styles.title}>Yearly Notes</div>
        <div className={styles.subtitle}>
          View notes you've worked on organized by year
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.timelinePaper}>
          <YearlyNotesTimeline
            data={data}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
```

### CSS Module (`src/pages/YearlyNotesPage/YearlyNotesPage.module.css`)

```css
.yearlyNotesPage {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg, #000);
  color: var(--color-text, #fff);
}

.header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border, #2f3336);
  background-color: var(--color-bg-paper, #111);
  flex-shrink: 0;
}

.title { font-weight: 600; font-size: 1.25rem; margin-bottom: 0.25rem; }
.subtitle { font-size: 0.875rem; color: var(--color-text-secondary, #9ca3af); }
.content { flex: 1; overflow: auto; padding: 0.75rem 1rem; }
.timelinePaper { padding: 0.75rem 0; background-color: transparent; }

@media (max-width: 600px) {
  .header { padding: 0.875rem 1rem; }
  .title { font-size: 1.125rem; }
  .content { padding: 0.5rem 0.75rem; }
}
```

## Worked example 2: a dialog built from shadcn primitives

Most interactive components need no CSS Module at all — compose shadcn
primitives and style them with Tailwind utility classNames directly.

### `src/pages/NotePage/components/CheckListView/components/AddCheckItemDialog/AddCheckItemDialog.tsx`

```tsx
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type AddCheckItemDialogProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export const AddCheckItemDialog: React.FC<AddCheckItemDialogProps> = ({
  isOpen,
  value,
  onChange,
  onSave,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
      <DialogTitle className="sr-only">New Check Item</DialogTitle>
      <Input
        placeholder="New Check Item"
        value={value}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSave();
          }
        }}
        enterKeyHint="done"
        autoFocus
      />
      <Button onClick={onSave} className="float-right mt-4">
        Create
      </Button>
    </DialogContent>
  </Dialog>
);
```

Note the `sr-only` `DialogTitle` — Radix's `Dialog` requires one for
accessibility even when the design doesn't show a visible heading.

## Component conventions

- Declare props as a `type` (not `interface`), e.g. `type MyProps = { readonly title: string }`.
- Use `const` arrow function components.
- Name event handlers `handleClick`, `handleKeyDown`, etc.
- Accessibility: keyboard support, `aria-label`, focus management on interactive elements.
