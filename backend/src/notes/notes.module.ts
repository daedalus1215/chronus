import { Note } from "./domain/entities/notes/note.entity";
import { Tag } from "./domain/entities/tag/tag.entity";
import { TagNote } from "./domain/entities/tag/tag-note.entity";
import { GetNoteNamesByUserIdAction } from "./apps/actions/get-note-names-by-userId.action";
import { Memo } from "./domain/entities/notes/memo.entity";
import { CreateNoteAction } from "./apps/actions/create-note-action/create-note.action";
import { CreateNoteTransactionScript } from "./domain/transaction-scripts/create-note.transaction.script";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { NoteMemoTagRepository } from "./infra/repositories/note-memo-tag.repository";
import { GetNoteByIdAction } from './apps/actions/get-note-by-id-action/get-note-by-id.action';
import { GetNoteByIdTransactionScript } from './domain/transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteAction } from "./apps/actions/update-note-action/update-note.action";
import { UpdateNoteTransactionScript } from "./domain/transaction-scripts/update-note-TS/update-note.transaction.script";
import { NoteDtoToEntityConverter } from "./domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter";

@Module({
  imports: [TypeOrmModule.forFeature([Note, Memo, Tag, TagNote])],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction
  ],
  providers: [
    NoteDtoToEntityConverter,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    NoteMemoTagRepository,
  ],
  exports: [NoteMemoTagRepository]
})
export class NotesModule {}
