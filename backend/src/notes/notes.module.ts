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
import { Checklist } from "./domain/entities/notes/checklist/checklist.entity";
import { ChecklistItem } from "./domain/entities/notes/checklist/checklistitem.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Note, Memo, Tag, TagNote, Checklist, ChecklistItem])],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction,
    UpdateNoteTimestampAction
  ],
  providers: [
    NoteDtoToEntityConverter,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    NoteMemoTagRepository,
    NoteAggregator,
  ],
  exports: [
    NoteMemoTagRepository,
    NoteAggregator,
  ]
})
export class NotesModule {}
