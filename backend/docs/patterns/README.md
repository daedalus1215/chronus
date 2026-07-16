# Architecture patterns

DDD pattern definitions and dependency injection rules for the Chronus backend architecture. Each pattern has a dedicated page describing its purpose, constraints, and injection rules.

## Foundational reading

- [[design-philosophy]] — the intellectual lineage: three paradigms, four architecture influences, and the four design goals that explain every pattern choice
- [[dependency-hierarchy]] — master dependency graph and injection rules across all layers

## Application layer

- [[application/action-pattern]] — HTTP endpoint handlers (one per route)
- [[application/webhook-pattern]] — inbound HTTP callbacks from backend services
- [[application/listener-pattern]] — inbound domain events from message queues
- [[application/dto-pattern]] — request/response Data Transfer Objects with validation
- [[application/testing-conventions]] — mock helpers, naming, coverage, test structure

## Domain layer

- [[domain/domain-service-pattern]] — orchestrates transaction scripts and aggregators
- [[domain/runner-pattern]] — projection-driven outbox entry point (called by Pollers)
- [[domain/transaction-script-pattern]] — single-use-case business transactions
- [[domain/aggregator-pattern]] — cross-domain coordination via ports
- [[domain/mapper-pattern]] — high-level transformation orchestration
- [[domain/assembler-pattern]] — combines converters + repositories to build objects
- [[domain/converter-pattern]] — pure stateless data transformation
- [[domain/comparator-pattern]] — pure stateless ordering logic
- [[domain/validator-pattern]] — assert domain invariants, throw on violation
- [[domain/projection-pattern]] — read-only output types from domain components
- [[domain/entity-pattern]] — TypeORM entities and domain objects

## Infrastructure layer

- [[infrastructure/repository-pattern]] — data access and TypeORM queries
- [[infrastructure/dispatcher-pattern]] — domain event publishing to external systems
- [[infrastructure/remote-caller-pattern]] — outbound commands to external services
- [[infrastructure/messaging-pattern]] — Runner, EventHandler, BatchProcessor, Facade roles

## Cross-cutting

- [[registry-pattern]] — NestJS module dependency registration arrays
- [[outbox-emission-flows]] — command-driven vs projection-driven outbox emission, full flow diagrams

## Related docs

- [[../general-coding-rules/README]] — API design and hook patterns
- [[../data-manual/README]] — schema and naming conventions these patterns produce
