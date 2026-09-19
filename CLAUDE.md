# Chronus — Claude Instructions

> **AGENTS.md is the canonical instruction set** for this repository. It is
> auto-discovered by Hermes, Claude Code, Copilot, and similar agent frameworks.
> This file holds Claude-specific additions that don't belong in the shared
> AGENTS.md. When the two disagree, AGENTS.md wins.

## Migrations

One migration = one concern. If a name would need to describe two tables or two operations, split into two files with sequential timestamps.

```
{unix_ms}-{verb}__{description}__{table}_table.ts
```

Verbs: `create` · `alter` · `update` · `drop` · `delete`  
Double underscore `__` between segments, single underscore within.

```
✅  1775800000000-create__folders_table.ts
✅  1775800000001-alter__add_folder_id_column__notes_table.ts
❌  1775800000000-create__folders_table__add_folder_id_to_notes.ts
```

## Backend module structure

```
{module}/apps/actions/
└── {verb}-{entity}-action/
    ├── {verb}-{entity}.action.ts
    ├── {verb}-{entity}.dto.ts            ← request DTOs live with the action
    └── {verb}-{entity}.action.swagger.ts

{module}/apps/dtos/responses/          ← shared response DTOs only
```

Actions that have no request body (GET, DELETE with no body) do not need a request DTO.

## Pattern reference docs

Full DDD pattern documentation (24 pages) is in `backend/docs/patterns/`. Start with `backend/docs/patterns/README.md` for the index, or `backend/docs/patterns/design-philosophy.md` for the architectural reasoning behind the patterns.

## See also

- `AGENTS.md` — canonical agent instructions (architecture, dependency rules, skills, references)
- `backend/AGENTS.md` — backend commands, pattern inventory, naming conventions, testing conventions, worked endpoint example
- `frontend/AGENTS.md` — frontend commands, styling rules, theme, routing, data fetching, worked page example
