---
name: chronus-architecture-review
description: Review dependency injection and architecture rules including the blackbox principle with correct and incorrect examples.
---

# Architecture review -- dependency injection and blackbox principle

## When to use

You are reviewing or creating code that involves dependency injection between patterns (Converters, Assemblers, Mappers, Transaction Scripts, Services, Aggregators, Repositories).

## Dependency hierarchy (high to low)

```
Entry points (Actions, Webhooks, Listeners)
  -> Domain Services
  -> Aggregators (via ports)
  -> Transaction Scripts
  -> Mappers
  -> Assemblers
  -> Converters (no dependencies)
  -> Repositories (data only)
  -> Dispatchers / RemoteCallers
```

## Full dependency matrix

| Component | Can inject | Cannot inject |
|-----------|------------|---------------|
| Converters | Nothing | Repos, TS, Services, other Converters |
| Assemblers | Converters, Repos (shallow) | TS, Services, Mappers, other Assemblers |
| Mappers | Assemblers, Converters, Repos | TS, Services, other Mappers |
| Transaction Scripts | Repos, Mappers, Aggregators, Converters* | Services, other TS |
| Domain Services | TS, Aggregators, Repos (simple lookups) | Other Services, Mappers, Converters |
| Aggregators | TS, Repos (simple lookups) | Services, other Aggregators |
| Repositories | TypeORM Repository, other Repos | TS, Services, Converters |

*Converter only if NOT already used inside a Mapper/Assembler (see Blackbox below).

## The blackbox principle

If pattern A uses B, and B uses C, then A should only depend on B. B is a **blackbox** for A. The lower pattern (C) lives next to B. A should not even know C exists.

### Correct example

A Transaction Script uses a Mapper. The Mapper internally uses a Converter. The Transaction Script does NOT inject the Converter.

```typescript
@Injectable()
export class InvoiceToDtoConverter {
  apply(entity: Invoice): InvoiceDto {
    return {
      id: entity.id,
      total: Number(entity.total),
      balanceDue: Number(entity.balanceDue),
    };
  }
}

@Injectable()
export class InvoiceWithPaymentsMapper {
  constructor(private readonly converter: InvoiceToDtoConverter) {}

  map(invoice: Invoice, payments: Payment[]): InvoiceWithPaymentsDto {
    return {
      invoice: this.converter.apply(invoice),
      payments: payments.map((p) => ({ id: p.id, amount: p.amount })),
    };
  }
}

@Injectable()
export class GetInvoiceWithPaymentsTransactionScript {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly paymentRepository: PaymentApplicationRepository,
    private readonly mapper: InvoiceWithPaymentsMapper, // uses mapper, not converter
  ) {}

  async execute(invoiceId: number): Promise<InvoiceWithPaymentsDto> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    const payments = await this.paymentRepository.findByInvoiceId(invoiceId);
    return this.mapper.map(invoice, payments);
  }
}
```

### Incorrect example

The Transaction Script injects BOTH the Mapper AND the Converter that the Mapper already uses:

```typescript
// WRONG -- violates blackbox
@Injectable()
export class GetInvoiceWithPaymentsTransactionScript {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly mapper: InvoiceWithPaymentsMapper,
    private readonly converter: InvoiceToDtoConverter, // blackbox violation
  ) {}
}
```

### Exception

If no Mapper or Assembler uses the Converter, a Transaction Script may use it directly.

## No same-level injection

Patterns at the same level must NOT inject each other:

- Transaction Scripts must NOT inject other Transaction Scripts (use a Service to orchestrate)
- Converters must NOT inject other Converters (use an Assembler)
- Aggregators must NOT inject other Aggregators (use ports)
- Mappers must NOT inject other Mappers (restructure or use a TS to orchestrate)

When same-level patterns need to work together, move orchestration **up one level**.

## SOLID principles in Transaction Scripts

- **Single Responsibility**: One use case per Transaction Script
- **Open/Closed**: Extend via new scripts, don't modify existing ones for unrelated use cases
- **Dependency Inversion**: Depend on abstractions (ports/interfaces) for cross-domain

## Review checklist

- [ ] No same-level injection violations
- [ ] Blackbox principle respected (no double-injection of leaf + composed pattern)
- [ ] Transaction Scripts contain domain logic, not Services
- [ ] Services orchestrate, not implement
- [ ] Aggregators are the only cross-domain bridge
- [ ] Repositories have no business logic
- [ ] Converters have no dependencies
