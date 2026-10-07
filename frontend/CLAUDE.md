# Frontend — Claude Instructions

> **`frontend/AGENTS.md` is the canonical reference** for the Chronus React
> frontend. This file holds Claude-specific additions. When the two disagree,
> AGENTS.md wins.

## Quick reference

```bash
cd frontend
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # preview production build locally
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Styling rules — migration in progress

**The project is migrating from MUI + CSS Modules to Tailwind v4 + shadcn/ui.**
This section is stale and will be rewritten once the migration finishes; until
then treat both approaches as valid depending on whether a given file has
been migrated yet.

- New/migrated components: Tailwind utility classes, shadcn/ui primitives
  from `src/components/ui/`, `cn()` from `src/lib/utils.ts` (now backed by
  `tailwind-merge`) for conditional/merged classes.
- Not-yet-migrated components: still MUI `sx` + CSS Modules — do not mix the
  two systems within one component during a partial migration.
- **Global tokens** live in `src/styles/global.scss` as CSS custom properties
  (`--background`, `--foreground`, `--primary`, etc., OKLCH-based, shadcn
  "new-york" convention) and are mapped into Tailwind's theme via
  `src/styles/tailwind.css` (`@theme inline`). Both MUI's `theme.ts` and
  Tailwind read from the same variables — don't hardcode hex.

## Theme

Dark mode. Palette: primary `#6366f1`, secondary `#ffd700`, background default `#000`, paper `#111`. Use `theme.palette.*` via `sx` or `useTheme()` — don't hardcode hex unless matching a design token.

## Data fetching

Use **React Query** (`@tanstack/react-query`). Hooks live in `src/hooks/` (shared) or co-located in `src/pages/{PageName}/hooks/` (page-specific). API request functions live in `src/api/requests/`. The Axios instance with interceptors is in `src/api/axios.interceptor.ts`.

## Component conventions

- Declare props as a `type` (not `interface`).
- Use `const` arrow function components.
- Name event handlers `handleClick`, `handleKeyDown`, etc.
- Accessibility: keyboard support, `aria-label`, focus management on interactive elements.
- Routes registered in `src/App.tsx` via `react-router-dom`. Route constants in `src/constants/routes.ts`.

## See also

- `frontend/AGENTS.md` — full worked page + CSS Module example, theme reference, routing, data fetching patterns
- `AGENTS.md` (root) — project-wide architecture, dependency rules, skills index
