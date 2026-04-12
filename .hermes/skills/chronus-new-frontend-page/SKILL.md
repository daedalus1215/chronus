---
name: chronus-new-frontend-page
description: Step-by-step procedure for creating a new React page or component with MUI and CSS Modules.
---

# Create a new React page or component

## When to use

You are adding a new page or significant component to the Chronus React frontend.

## Procedure

### Step 1: Create the page directory

Location: `frontend/src/pages/{PageName}/`

Each page gets its own folder. Components specific to the page go in `components/`, hooks in `hooks/`.

```
frontend/src/pages/YearlyNotesPage/
  YearlyNotesPage.tsx
  YearlyNotesPage.module.css
  components/
    YearlyNotesTimeline/
      YearlyNotesTimeline.tsx
  hooks/
    useNotesByYear.ts
```

### Step 2: Create the page component

Use `const` arrow function. Props as a `type`. Combine MUI `Box`/`Typography` with CSS Modules for layout.

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

### Step 3: Create the CSS Module

Location: `{PageName}.module.css` next to the component.

Use CSS custom properties from `global.scss` for colors. Include a mobile breakpoint.

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

@media (max-width: 600px) {
  .header { padding: 0.875rem 1rem; }
  .title { font-size: 1.125rem; }
  .content { padding: 0.5rem 0.75rem; }
}
```

### Step 4: Create the data-fetching hook

Location: `hooks/use{Feature}.ts` (page-specific) or `frontend/src/hooks/` (shared).

Use React Query (`@tanstack/react-query`).

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchNotesByYear } from '../../../api/requests/time-tracks.requests';

export const useNotesByYear = () => {
  return useQuery({
    queryKey: ['notes-by-year'],
    queryFn: fetchNotesByYear,
  });
};
```

### Step 5: Create the API request function

Location: `frontend/src/api/requests/{domain}.requests.ts`

Uses the Axios instance from `api/axios.interceptor.ts` which auto-prefixes `/api` and attaches the JWT.

```typescript
import api from '../axios.interceptor';

export const fetchNotesByYear = async () => {
  const { data } = await api.get('/time-tracks/notes-by-year');
  return data;
};
```

### Step 6: Register the route

Location: `frontend/src/App.tsx` inside `AppRoutes`.

Add a `<Route>` inside the `<AuthenticatedLayout>` wrapper. Add a route constant in `frontend/src/constants/routes.ts`.

```tsx
<Route path={ROUTES.YEARLY_NOTES} element={<YearlyNotesPage />} />
```

## Styling rules

1. **MUI `sx` prop** for quick spacing, flex, colors from theme.
2. **CSS Modules** (`.module.css`) for complex/reusable rules.
3. **Global tokens** in `frontend/src/styles/global.scss` (CSS custom properties).
4. **No Tailwind**. Use `clsx` / the `cn` helper only for merging CSS module class names.

## MUI theme reference

```typescript
palette: {
  mode: 'dark',
  primary: { main: '#6366f1' },
  secondary: { main: '#ffd700' },
  background: { default: '#000', paper: '#111' },
  text: { primary: '#fff', secondary: '#9ca3af' },
}
```

## Checklist

- [ ] Page folder with component + CSS Module
- [ ] Props defined as `type`
- [ ] React Query hook for data fetching
- [ ] API request function in `api/requests/`
- [ ] Route registered in `App.tsx`
- [ ] Mobile breakpoint in CSS Module
- [ ] Accessibility: keyboard support, aria labels on interactive elements
