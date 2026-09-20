import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './domain/entities/tag.entity';
import { TagNote } from '../shared-kernel/domain/entities/tag-note.entity';
import { TagRepository } from './infra/repositories/tag-repository/tag.repository';
import { AddTagToNoteTransactionScript } from './domain/transaction-scripts/add-tag-to-note-TS/add-tag-to-note.transaction.script';
import { GetTagsByNoteIdTransactionScript } from './domain/transaction-scripts/get-tags-by-note-id-TS/get-tags-by-note-id.transaction.script';
import { GetTagsByNoteIdsTransactionScript } from './domain/transaction-scripts/get-tags-by-note-ids-TS/get-tags-by-note-ids.transaction.script';
import { GetTagsByUserIdTransactionScript } from './domain/transaction-scripts/get-tags-by-user-id-TS/get-tags-by-user-id.transaction.script';
import { TagAggregator } from './domain/aggregators/tag.aggregator';
import { UpdateTagTransactionScript } from './domain/transaction-scripts/update-tag-TS/update-tag.transaction.script';
import { DeleteTagTransactionScript } from './domain/transaction-scripts/delete-tag-TS/delete-tag.transaction.script';
import { AddTagToNoteAction } from './apps/actions/add-tag-to-note-action/add-tag-to-note.action';
import { GetTagsByNoteIdAction } from './apps/actions/get-tags-by-note-id-action/get-tags-by-note-id.action';
import { GetTagsByUserIdAction } from './apps/actions/get-tags-by-user-id-action/get-tags-by-user-id.action';
import { GetTagByIdAction } from './apps/actions/get-tag-by-id-action/get-tag-by-id.action';
import { UpdateTagAction } from './apps/actions/update-tag-action/update-tag.action';
import { DeleteTagAction } from './apps/actions/delete-tag-action/delete-tag.action';
import { TagService } from './domain/services/tag.service';
import { RemoveTagFromNoteAction } from './apps/actions/remove-tag-from-note-action/remove-tag-from-note.action';
import { RemoveTagFromNoteTransactionScript } from './domain/transaction-scripts/remove-tag-from-note-TS/remove-tag-from-note.transaction.script';
import { TagNoteRepository } from './infra/repositories/tag-note.repository';
import { DeleteNoteTagAssociationsListener } from './apps/listeners/delete-note-tag-associations.listener';
import { TAG_ATTACH_PORT } from '../note-transfer/domain/ports/tag-attacher.port';

/**
 * Tags module: encapsulates all tag-related logic, actions, and persistence.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Tag, TagNote])],
  providers: [
    TagRepository,
    TagNoteRepository,
    AddTagToNoteTransactionScript,
    GetTagsByNoteIdTransactionScript,
    GetTagsByNoteIdsTransactionScript,
    GetTagsByUserIdTransactionScript,
    UpdateTagTransactionScript,
    DeleteTagTransactionScript,
    RemoveTagFromNoteTransactionScript,
    TagService,
    TagAggregator,
    DeleteNoteTagAssociationsListener,
    {
      provide: TAG_ATTACH_PORT,
      useExisting: TagAggregator,
    },
  ],
  controllers: [
    AddTagToNoteAction,
    GetTagsByNoteIdAction,
    GetTagsByUserIdAction,
    GetTagByIdAction,
    UpdateTagAction,
    DeleteTagAction,
    RemoveTagFromNoteAction,
  ],
  exports: [
    TagRepository,
    TagNoteRepository,
    AddTagToNoteTransactionScript,
    GetTagsByNoteIdTransactionScript,
    GetTagsByNoteIdsTransactionScript,
    GetTagsByUserIdTransactionScript,
    TagService,
    TagAggregator,
    DeleteNoteTagAssociationsListener,
    TAG_ATTACH_PORT,
  ],
})
export class TagsModule {}
