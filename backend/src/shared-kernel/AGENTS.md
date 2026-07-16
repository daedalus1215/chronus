# shared-kernel module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Shared infrastructure -- cross-domain join entities, shared types, guards, decorators, logging.

## Location

`backend/src/shared-kernel/`

## Entities

- `TagNote (M:N join entity, anemic)`

## Shared infrastructure

- Guards: JwtAuthGuard
- Decorators: ProtectedAction, GetAuthUser
- Logging: LoggingModule (nestjs-pino)

## Folder structure

```
shared-kernel/
  domain/
    entities/
      tag-note.entity.ts        # M:N join entity (anemic)
    types/
  apps/
    decorators/
      protected-action.decorator.ts
      get-auth-user.decorator.ts
    guards/
      jwt-auth.guard.ts
    logging/
      logging.module.ts         # nestjs-pino
  shared-kernel.module.ts
```
