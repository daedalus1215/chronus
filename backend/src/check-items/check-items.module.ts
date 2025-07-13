import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckItem } from "./domain/entities/check-item.entity";
import { CheckItemsRepository } from "./infra/repositories/check-items.repository";
import { CreateCheckItemAction } from "./apps/actions/create-check-item/create-check-item.action";
import { CreateCheckItemTransactionScript } from "./domain/transaction-scripts/create-check-item/create-check-item.transaction.script";
import { CheckItemService } from "./domain/services/check-item.service";
import { NotesModule } from "../notes/notes.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckItem]),
    NotesModule,
  ],
  providers: [
    CheckItemsRepository,
    CreateCheckItemTransactionScript,
    CheckItemService,
  ],
  controllers: [
    CreateCheckItemAction,
  ],
  exports: [CheckItemsRepository],
})
export class CheckItemsModule {} 