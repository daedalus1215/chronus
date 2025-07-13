import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Note } from "./domain/entities/notes/note.entity";
import { Memo } from "./domain/entities/notes/memo.entity";
import { NoteMemoTagRepository } from "./infra/repositories/note-memo-tag.repository";
import { GetNoteNamesByUserIdAction } from "./apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action";
import { CreateNoteAction } from "./apps/actions/notes/create-note-action/create-note.action";
import { CreateNoteTransactionScript } from "./domain/transaction-scripts/create-note.transaction.script";
import { GetNoteByIdAction } from "./apps/actions/notes/get-note-by-id-action/get-note-by-id.action";
import { GetNoteByIdTransactionScript } from "./domain/transaction-scripts/get-note-by-id.transaction.script";
import { UpdateNoteAction } from "./apps/actions/notes/update-note-action/update-note.action";
import { UpdateNoteTransactionScript } from "./domain/transaction-scripts/update-note-TS/update-note.transaction.script";
import { NoteDtoToEntityConverter } from "./domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter";
import { NoteAggregator } from "./domain/aggregators/note.aggregator";
import { UpdateNoteTimestampAction } from "./apps/actions/update-note-timestamp.action";
import { GetCheckItemAction } from "./apps/actions/notes/get-check-item-action/get-check-item.action";
import { GetCheckItemTransactionScript } from "./domain/transaction-scripts/get-check-item.transaction.script";
import { ToggleCheckItemAction } from "./apps/actions/notes/toggle-check-item/toggle-check-item.action";
import { ToggleCheckItemTransactionScript } from "./domain/transaction-scripts/toggle-check-item.transaction.script";
import { UpdateNoteTitleAction } from "./apps/actions/notes/update-note-title-action/update-note-title.action";
import { UpdateNoteTitleTransactionScript } from "./domain/transaction-scripts/update-note-title.transaction.script";
import { DeleteNoteAction } from "./apps/actions/notes/delete-note.action";
import { DeleteCheckItemAction } from "./apps/actions/notes/delete-check-item.action";
import { DeleteCheckItemTransactionScript } from "./domain/transaction-scripts/delete-check-item.transaction.script";

/**
 * Notes module: encapsulates all note-related logic, actions, and persistence.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Note, Memo])],
  providers: [
    NoteMemoTagRepository,
    NoteAggregator,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    GetCheckItemTransactionScript,
    ToggleCheckItemTransactionScript,
    UpdateNoteTitleTransactionScript,
    DeleteCheckItemTransactionScript,
    NoteDtoToEntityConverter
  ],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction,
    UpdateNoteTimestampAction,
    GetCheckItemAction,
    ToggleCheckItemAction,
    UpdateNoteTitleAction,
    DeleteNoteAction,
    DeleteCheckItemAction,
  ],
  exports: [NoteMemoTagRepository, NoteAggregator],
})
export class NotesModule {}
