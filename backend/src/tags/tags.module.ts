import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './domain/entities/tag.entity';
import { TagNote } from '../shared-kernel/domain/entities/tag-note.entity';
import { TagRepository } from './infra/repositories/tag.repository';
import { AddTagToNoteTransactionScript } from './domain/transaction-scripts/add-tag-to-note.transaction.script';
import { GetTagsByNoteIdTransactionScript } from './domain/transaction-scripts/get-tags-by-note-id.transaction.script';
import { GetTagsByUserIdTransactionScript } from './domain/transaction-scripts/get-tags-by-user-id.transaction.script';
import { AddTagToNoteAction } from './app/actions/add-tag-to-note-action/add-tag-to-note.action';
import { GetTagsByNoteIdAction } from './app/actions/get-tags-by-note-id-action/get-tags-by-note-id.action';
import { GetTagsByUserIdAction } from './app/actions/get-tags-by-user-id-action/get-tags-by-user-id.action';
import { TagService } from './domain/services/tag.service';
import { RemoveTagFromNoteAction } from './app/actions/remove-tag-from-note-action/remove-tag-from-note.action';
import { RemoveTagFromNoteTransactionScript } from './domain/transaction-scripts/remove-tag-from-note/remove-tag-from-note.transaction.script';
import { TagNoteRepository } from './infra/repositories/tag-note.repository';
import { DeleteNoteTagAssociationsListener } from './apps/listeners/delete-note-tag-associations.listener';

/**
 * Tags module: encapsulates all tag-related logic, actions, and persistence.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, TagNote]),
  ],
  providers: [
    TagRepository,
    TagNoteRepository,
    AddTagToNoteTransactionScript,
    GetTagsByNoteIdTransactionScript,
    GetTagsByUserIdTransactionScript,
    RemoveTagFromNoteTransactionScript,
    TagService,
    DeleteNoteTagAssociationsListener,
  ],
  controllers: [
    AddTagToNoteAction,
    GetTagsByNoteIdAction,
    GetTagsByUserIdAction,
    RemoveTagFromNoteAction,
  ],
  exports: [
    TagRepository, 
    TagNoteRepository,
    AddTagToNoteTransactionScript, 
    GetTagsByNoteIdTransactionScript, 
    GetTagsByUserIdTransactionScript, 
    TagService,
    DeleteNoteTagAssociationsListener,
  ],
})
export class TagsModule {} 