import { Note } from "./domain/entities/notes/note.entity";
import { Tag } from "./domain/entities/tag/tag.entity";
import { TagNote } from "./domain/entities/tag/tag-note.entity";
import { GetNoteNamesByUserIdAction } from "./apps/actions/get-note-names-by-userId.action";
import { Memo } from "./domain/entities/notes/memo.entity";
import { CreateNoteAction } from "./apps/actions/create-note.action";
import { CreateNoteTransactionScript } from "./domain/transaction-scripts/create-note.transaction.script";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { NoteTagRepository } from "./infra/repositories/note-tag.repository";
import { GetNoteByIdAction } from './apps/actions/get-note-by-id.action';
import { GetNoteByIdTransactionScript } from './domain/transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteAction } from "./apps/actions/update-note.action";
import { UpdateNoteTransactionScript } from "./domain/transaction-scripts/update-note.transaction.script";

@Module({
  imports: [TypeOrmModule.forFeature([Note, Memo, Tag, TagNote])],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction
  ],
  providers: [
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    NoteTagRepository,
  ],
  exports: [NoteTagRepository]
})
export class NotesModule {}
