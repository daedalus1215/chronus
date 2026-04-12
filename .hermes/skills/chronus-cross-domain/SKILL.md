---
name: chronus-cross-domain
description: Guidelines and worked examples for cross-domain communication using Aggregators and shared-kernel join entities.
---

# Cross-domain communication

## When to use

You need to read or write data that belongs to a different bounded context/module, or you are modeling a many-to-many relationship that spans two domains.

## Core rules

1. **Never** reference an entity from another domain inside your entity (no cross-domain ORM relations for unrelated aggregates).
2. **Always** expose cross-domain behavior through an **Aggregator** in the owning domain.
3. The consuming domain injects the Aggregator -- not the other domain's Repository or Transaction Script.
4. Aggregators can inject Transaction Scripts and Repositories from their **own** domain only.
5. Aggregators must NOT inject other Aggregators or Domain Services.

## Aggregator pattern

The owning domain creates an Aggregator that exposes specific operations. Other modules' Services inject it.

### Example: PaymentAggregator (owned by payments module)

```typescript
// src/payments/domain/aggregators/payment.aggregator.ts
@Injectable()
export class PaymentAggregator {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentApplicationRepository: PaymentApplicationRepository,
  ) {}

  async hasPaymentApplications(invoiceId: number): Promise<boolean> {
    const applications = await this.paymentApplicationRepository.findByInvoiceId(invoiceId);
    return applications.length > 0;
  }

  async getAccountBalance(accountId: number): Promise<number> {
    const { credits, debits } = await this.paymentRepository.getAccountPaymentsSums(accountId);
    return credits - debits;
  }
}
```

### Example: consuming from another domain's Service

```typescript
// src/invoices/domain/services/invoice.service.ts
@Injectable()
export class InvoiceService {
  constructor(
    private readonly cancelInvoiceTS: CancelInvoiceTransactionScript,
    private readonly paymentAggregator: PaymentAggregator, // cross-domain
  ) {}

  async cancelInvoice(invoiceId: number, issuerUserId: number): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);
    const hasPayments = await this.paymentAggregator.hasPaymentApplications(invoiceId);
    if (hasPayments) {
      throw new Error('Cannot cancel: invoice has existing payments');
    }
    return await this.cancelInvoiceTS.execute(invoiceId);
  }
}
```

### Module wiring for cross-domain

The owning module **exports** the Aggregator. The consuming module **imports** the owning module.

```typescript
// src/payments/payments.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentApplication])],
  providers: [PaymentAggregator, PaymentRepository, PaymentApplicationRepository],
  exports: [PaymentAggregator],  // exposed to other modules
})
export class PaymentsModule {}

// src/invoices/invoices.module.ts
@Module({
  imports: [PaymentsModule],  // gives access to PaymentAggregator
  providers: [InvoiceService, CancelInvoiceTransactionScript],
})
export class InvoicesModule {}
```

## Existing cross-domain aggregators in Chronus

- `NoteAggregator` (notes module) -- used by time-tracks to validate note ownership
- `TagAggregator` (tags module) -- used by time-tracks to get tags by note IDs
- Events via `EventEmitter2` -- used for loose coupling (e.g., `GET_NOTE_DETAILS_COMMAND`)

## Join entity exception (shared-kernel)

For many-to-many relationships that span two domains, the join entity lives in the **shared-kernel**, not in either domain. Keep it anemic (no business logic).

```typescript
// src/shared-kernel/domain/entities/tag-note.entity.ts
@Entity({ name: 'tag_notes' })
export class TagNote {
  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;

  @PrimaryColumn({ name: 'note_id' })
  noteId: number;
}
```

Repository methods for join tables should prefer **ID-based queries** (raw SQL or query builder) over full entity relations:

```typescript
async findNoteIdsByTagId(tagId: number): Promise<number[]> {
  const rows = await this.repository
    .createQueryBuilder('tn')
    .select('tn.note_id', 'noteId')
    .where('tn.tag_id = :tagId', { tagId })
    .getRawMany();
  return rows.map(r => r.noteId);
}
```

## Checklist

- [ ] No cross-domain entity references (no `@ManyToOne` to another domain's entity)
- [ ] Cross-domain access goes through an Aggregator
- [ ] Aggregator is exported from the owning module
- [ ] Consuming module imports the owning module
- [ ] Join entities live in shared-kernel, are anemic
- [ ] Join table queries use IDs, not full entity relations
