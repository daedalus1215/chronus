import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckItem } from './domain/entities/check-item.entity';
import { CheckItemsRepository } from './infra/repositories/check-items/check-items.repository';
import { CreateCheckItemAction } from './apps/actions/create-check-item/create-check-item.action';
import { GetCheckItemAction } from './apps/actions/get-check-item/get-check-item.action';
import { ToggleCheckItemAction } from './apps/actions/toggle-check-item/toggle-check-item.action';
import { DeleteCheckItemAction } from './apps/actions/delete-check-item/delete-check-item.action';
import { UpdateCheckItemAction } from './apps/actions/update-check-item/update-check-item.action';
import { UpdateCheckItemStatusAction } from './apps/actions/update-check-item-status/update-check-item-status.action';
import { GetCheckItemsByNoteAction } from './apps/actions/get-check-items-by-note/get-check-items-by-note.action';
import { ReorderCheckItemsAction } from './apps/actions/reorder-check-items/reorder-check-items.action';
import { CreateCheckItemTransactionScript } from './domain/transaction-scripts/create-check-item/create-check-item.transaction.script';
import { GetCheckItemTransactionScript } from './domain/transaction-scripts/get-check-item/get-check-item.transaction.script';
import { ToggleCheckItemTransactionScript } from './domain/transaction-scripts/toggle-check-item/toggle-check-item.transaction.script';
import { DeleteCheckItemTransactionScript } from './domain/transaction-scripts/delete-check-item/delete-check-item.transaction.script';
import { UpdateCheckItemTransactionScript } from './domain/transaction-scripts/update-check-item/update-check-item.transaction.script';
import { UpdateCheckItemStatusTransactionScript } from './domain/transaction-scripts/update-check-item-status/update-check-item-status.transaction.script';
import { GetCheckItemsByNoteTransactionScript } from './domain/transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script';
import { ReorderCheckItemsTransactionScript } from './domain/transaction-scripts/reorder-check-items/reorder-check-items.transaction.script';
import { CheckItemService } from './domain/services/check-item.service';
import { CheckItemsHydrator } from './infra/repositories/check-items/check-items.hydrator';
import { CheckItemsAggregator } from './domain/aggregators/check-items.aggregator';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DeleteCheckItemsByNoteListener } from './apps/listeners/delete-check-items-by-note.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckItem]),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    CheckItemsRepository,
    CheckItemsHydrator,
    CreateCheckItemTransactionScript,
    GetCheckItemTransactionScript,
    ToggleCheckItemTransactionScript,
    DeleteCheckItemTransactionScript,
    UpdateCheckItemTransactionScript,
    UpdateCheckItemStatusTransactionScript,
    GetCheckItemsByNoteTransactionScript,
    ReorderCheckItemsTransactionScript,
    CheckItemService,
    CheckItemsAggregator,
    DeleteCheckItemsByNoteListener,
  ],
  controllers: [
    CreateCheckItemAction,
    GetCheckItemAction,
    ToggleCheckItemAction,
    DeleteCheckItemAction,
    UpdateCheckItemAction,
    UpdateCheckItemStatusAction,
    GetCheckItemsByNoteAction,
    ReorderCheckItemsAction,
  ],
  exports: [CheckItemsRepository, CheckItemService, CheckItemsAggregator],
})
export class CheckItemsModule {}
