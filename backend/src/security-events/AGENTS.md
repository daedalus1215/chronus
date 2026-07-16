# security-events module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Security event logging -- failed logins, password changes, suspicious activity.

## Location

`backend/src/security-events/`

## Aggregators

- SecurityEventAggregator (exported -- consumed by auth, users)

## Entities

- `SecurityEvent` (`domain/entities/`)

## Repositories

Folder: `infra/repositories/`

- `SecurityEventRepository`

## Exports

- `SecurityEventAggregator`

## Folder structure

```
security-events/
  N/A (no actions -- aggregator-only module)actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
  N/A (no actions -- aggregator-only module)dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
    entities/
  infra/repositories/
  security-events.module.ts
```
