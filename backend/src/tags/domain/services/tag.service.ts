import { Injectable } from '@nestjs/common';
import { AddTagToNoteTransactionScript } from '../transaction-scripts/add-tag-to-note-TS/add-tag-to-note.transaction.script';
import { DeleteTagTransactionScript } from '../transaction-scripts/delete-tag-TS/delete-tag.transaction.script';
import { GetTagByIdTransactionScript } from '../transaction-scripts/get-tag-by-id-TS/get-tag-by-id.transaction.script';
import { GetTagsByNoteIdTransactionScript } from '../transaction-scripts/get-tags-by-note-id-TS/get-tags-by-note-id.transaction.script';
import { GetTagsByUserIdTransactionScript } from '../transaction-scripts/get-tags-by-user-id-TS/get-tags-by-user-id.transaction.script';
import { RemoveTagFromNoteTransactionScript } from '../transaction-scripts/remove-tag-from-note-TS/remove-tag-from-note.transaction.script';
import { UpdateTagTransactionScript } from '../transaction-scripts/update-tag-TS/update-tag.transaction.script';
import { AddTagToNoteDto } from '../../apps/dtos/requests/add-tag-to-note.dto';
import { UpdateTagDto } from '../../apps/actions/update-tag-action/update-tag.dto';
import { TagResponseDto } from '../../apps/dtos/responses/tag.response.dto';
import { Tag } from '../entities/tag.entity';
import { GetTagsByUserIdProjection } from '../transaction-scripts/get-tags-by-user-id-TS/get-tags-by-user-id.projection';

@Injectable()
export class TagService {
  constructor(
    private readonly addTagToNoteTS: AddTagToNoteTransactionScript,
    private readonly deleteTagTS: DeleteTagTransactionScript,
    private readonly getTagByIdTS: GetTagByIdTransactionScript,
    private readonly getTagsByNoteIdTS: GetTagsByNoteIdTransactionScript,
    private readonly getTagsByUserIdTS: GetTagsByUserIdTransactionScript,
    private readonly removeTagFromNoteTS: RemoveTagFromNoteTransactionScript,
    private readonly updateTagTS: UpdateTagTransactionScript
  ) {}

  addTagToNote(dto: AddTagToNoteDto & { userId: number }): Promise<Tag> {
    return this.addTagToNoteTS.apply(dto);
  }

  deleteTag(tagId: number, userId: number): Promise<void> {
    return this.deleteTagTS.apply(tagId, userId);
  }

  getTagById(tagId: number, userId: number): Promise<Tag> {
    return this.getTagByIdTS.apply(tagId, userId);
  }

  getTagsByNoteId(noteId: number): Promise<TagResponseDto[]> {
    return this.getTagsByNoteIdTS.apply(noteId);
  }

  getTagsByUserId(userId: number): Promise<GetTagsByUserIdProjection[]> {
    return this.getTagsByUserIdTS.apply(userId);
  }

  removeTagFromNote(tagId: number, noteId: number, userId: number): Promise<void> {
    return this.removeTagFromNoteTS.apply(tagId, noteId, userId);
  }

  updateTag(
    tagId: number,
    userId: number,
    updateTagDto: UpdateTagDto
  ): Promise<Tag> {
    return this.updateTagTS.apply(tagId, userId, updateTagDto);
  }
}
