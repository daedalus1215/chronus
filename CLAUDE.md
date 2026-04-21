# Chronus — Claude Instructions

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
{module}/app/actions/
└── {verb}-{entity}-action/
    ├── {verb}-{entity}.action.ts
    └── dtos/
        └── {verb}-{entity}.dto.ts    ← request DTOs live with the action

{module}/app/dtos/responses/          ← shared response DTOs only
```

Actions that have no request body (GET, DELETE with no body) do not need a `dtos/` subfolder.
