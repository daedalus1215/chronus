# users module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

User account management -- update username, update password.

## Location

`backend/src/users/`

## Actions

Folder base: `app/actions/`

- UpdateUsernameAction (PATCH /users/username)
- UpdatePasswordAction (PATCH /users/password)
- UsersController (GET /users -- user registration, legacy)

## Services

- `UsersService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `UpdateUsernameTransactionScript`
- `UpdatePasswordTransactionScript`

## Aggregators

- UserAggregator (exported)

## Entities

- `User` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `UserRepository`

## Module imports (cross-domain dependencies)

- `SecurityEventsModule`

## Exports

- `UsersService`
- `UserAggregator`

## Folder structure

```
users/
  app/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  app/dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
    entities/
  infra/repositories/
  users.module.ts
```
