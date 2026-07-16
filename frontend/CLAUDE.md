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

## Styling rules (non-negotiable)

1. **MUI `sx` prop** for quick layout and spacing (flex, gap, padding, margin, colors from theme).
2. **CSS Modules** (`.module.css`) co-located with the component for reusable or complex rules.
3. **Global tokens** live in `src/styles/global.scss` (CSS custom properties like `--color-bg`, `--color-text`).
4. **No Tailwind** — the project removed it. Use `clsx` (via the `cn` helper in `src/lib/utils.ts`) only for merging CSS module class names.

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
