# auth module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Authentication -- JWT login, token issuance, strategy.

## Location

`backend/src/auth/`

## Actions

Folder base: `app/actions/`

- LoginAction (POST /auth/login)

## Services

- `AuthService` (`domain/services/`)

## Entities

- `N/A (uses User entity from users module)` (`domain/entities/`)

## Module imports (cross-domain dependencies)

- `UsersModule`
- `SecurityEventsModule`
- `PassportModule`
- `JwtModule`

## Exports

- `AuthService`

## Folder structure

```
auth/
  app/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  app/dtos/
    requests/
    responses/
  domain/
    services/
    transaction-scripts/
    entities/
  N/Arepositories/
  auth.module.ts
```
