import { Note } from "./domain/entities/notes/note.entity";
import { Tag } from "./domain/entities/tag/tag.entity";
import { TagNote } from "./domain/entities/tag/tag-note.entity";
import { GetNoteNamesByUserIdAction } from "./apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action";
import { Memo } from "./domain/entities/notes/memo.entity";
import { CreateNoteAction } from "./apps/actions/notes/create-note-action/create-note.action";
import { CreateNoteTransactionScript } from "./domain/transaction-scripts/create-note.transaction.script";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { NoteMemoTagRepository } from "./infra/repositories/note-memo-tag.repository";
import { GetNoteByIdAction } from './apps/actions/notes/get-note-by-id-action/get-note-by-id.action';
import { GetNoteByIdTransactionScript } from './domain/transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteAction } from "./apps/actions/notes/update-note-action/update-note.action";
import { UpdateNoteTransactionScript } from "./domain/transaction-scripts/update-note-TS/update-note.transaction.script";
import { NoteDtoToEntityConverter } from "./domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter";
import { NoteAggregator } from './domain/aggregators/note.aggregator';
import { UpdateNoteTimestampAction } from './apps/actions/update-note-timestamp.action';
import { CheckItem } from "./domain/entities/notes/check-item.entity";
import { CreateCheckItemAction } from './apps/actions/notes/create-check-item-action/create-check-item.action';
import { CreateCheckItemTransactionScript } from './domain/transaction-scripts/create-check-item.transaction.script';
import { GetCheckItemAction } from './apps/actions/notes/get-check-item-action/get-check-item.action';
import { GetCheckItemTransactionScript } from './domain/transaction-scripts/get-check-item.transaction.script';
import { ToggleCheckItemAction } from './apps/actions/notes/toggle-check-item/toggle-check-item.action';
import { ToggleCheckItemTransactionScript } from './domain/transaction-scripts/toggle-check-item.transaction.script';
import { UpdateNoteTitleAction } from "./apps/actions/notes/update-note-title-action/update-note-title.action";
import { UpdateNoteTitleTransactionScript } from "./domain/transaction-scripts/update-note-TS/update-note-title.transaction.script";
import { DeleteNoteAction } from './apps/actions/notes/delete-note.action';
import { DeleteCheckItemAction } from './apps/actions/notes/delete-check-item.action';
import { DeleteCheckItemTransactionScript } from './domain/transaction-scripts/delete-check-item.transaction.script';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Memo, Tag, TagNote, CheckItem])],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction,
    UpdateNoteTimestampAction,
    CreateCheckItemAction,
    GetCheckItemAction,
    ToggleCheckItemAction,
    UpdateNoteTitleAction,
    DeleteNoteAction,
    DeleteCheckItemAction
  ],
  providers: [
    NoteDtoToEntityConverter,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    NoteMemoTagRepository,
    NoteAggregator,
    CreateCheckItemTransactionScript,
    GetCheckItemTransactionScript,
    ToggleCheckItemTransactionScript,
    UpdateNoteTitleTransactionScript,
    DeleteCheckItemTransactionScript
  ],
  exports: [
    NoteMemoTagRepository,
    NoteAggregator,
  ]
})
export class NotesModule {}
