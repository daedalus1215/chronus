# Frontend — React + MUI + modular CSS/SCSS hints

## Commands

```bash
cd frontend
npm run dev          # Vite dev server
npm run build        # production build
npm run preview      # preview production build locally
```

## Styling rules

1. **MUI `sx` prop** for quick layout and spacing (flex, gap, padding, margin, colors from theme).
2. **CSS Modules** (`.module.css`) co-located with the component for reusable or complex rules.
3. **Global tokens** live in `src/styles/global.scss` (CSS custom properties like `--color-bg`, `--color-text`).
4. **No Tailwind** — the project removed it. Use `clsx` (via the `cn` helper in `src/lib/utils.ts`) only for merging CSS module class names.

## Theme

Light and dark modes.

- `src/contexts/ThemeModeContext.tsx` — `ThemeModeProvider` + `useThemeMode()`. Modes: `'light' | 'dark' | 'system'` (system follows `prefers-color-scheme`, live). The selection persists under `STORAGE_KEYS.APPEARANCE.THEME_MODE`; the resolved mode is applied as `data-theme` on `<html>`. A pre-paint script in `index.html` applies the saved mode before React mounts (no flash).
- `src/theme.ts` — `createChronusTheme(mode)` builds the MUI theme per palette mode; `App.tsx` memoizes it from the context.
- `src/styles/global.scss` — design tokens. `:root` holds light-mode values, `[data-theme='dark']` holds dark-mode values. Always consume tokens (`var(--color-*)`, `var(--glass-*)`, `var(--elevation-*)`, …) — never hardcode hex/rgba in CSS or `sx`.
- Entry points: `ThemeToggleButton` in the app header (quick switch) and Settings → Appearance (Light / Dark / System).

Use `theme.palette.*` via `sx` or `useTheme()` for MUI colors — don't hardcode hex unless matching a design token.

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

## Worked example: a page with CSS Module

### Page component (`src/pages/YearlyNotesPage/YearlyNotesPage.tsx`)

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { YearlyNotesTimeline } from './components/YearlyNotesTimeline/YearlyNotesTimeline';
import { useNotesByYear } from './hooks/useNotesByYear';
import styles from './YearlyNotesPage.module.css';

export const YearlyNotesPage: React.FC = () => {
  const { data, isLoading, error } = useNotesByYear();

  return (
    <div className={styles.yearlyNotesPage}>
      <Box className={styles.header}>
        <Typography className={styles.title}>Yearly Notes</Typography>
        <Typography className={styles.subtitle}>
          View notes you've worked on organized by year
        </Typography>
      </Box>
      <Box className={styles.content}>
        <div className={styles.timelinePaper}>
          <YearlyNotesTimeline data={data} isLoading={isLoading} error={error} />
        </div>
      </Box>
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

## Component conventions

- Declare props as a `type` (not `interface`), e.g. `type MyProps = { readonly title: string }`.
- Use `const` arrow function components.
- Name event handlers `handleClick`, `handleKeyDown`, etc.
- Accessibility: keyboard support, `aria-label`, focus management on interactive elements.
