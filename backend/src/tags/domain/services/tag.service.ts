import { Injectable } from '@nestjs/common';
import { AddTagToNoteTransactionScript } from '../transaction-scripts/add-tag-to-note.transaction.script';
import { GetTagsByNoteIdTransactionScript } from '../transaction-scripts/get-tags-by-note-id.transaction.script';
import { GetTagsByUserIdTransactionScript} from '../transaction-scripts/get-tags-by-user-id.transaction.script';
import { AddTagToNoteDto } from '../../app/dtos/requests/add-tag-to-note.dto';
import { TagResponseDto } from '../../app/dtos/responses/tag.response.dto';
import { Tag } from '../entities/tag.entity';
import { GetTagsByUserIdProjection } from '../transaction-scripts/get-tags-by-user-id.projection';

@Injectable()
export class TagService {
  constructor(
    private readonly addTagToNoteTS: AddTagToNoteTransactionScript,
    private readonly getTagsByNoteIdTS: GetTagsByNoteIdTransactionScript,
    private readonly getTagsByUserIdTS: GetTagsByUserIdTransactionScript,
  ) {}

  addTagToNote(dto: AddTagToNoteDto & { userId: number }): Promise<Tag> {
    return this.addTagToNoteTS.apply(dto);
  }

  getTagsByNoteId(noteId: number): Promise<TagResponseDto[]> {
    return this.getTagsByNoteIdTS.apply(noteId);
  }

  getTagsByUserId(userId: number): Promise<GetTagsByUserIdProjection[]> {
    return this.getTagsByUserIdTS.apply(userId);
  }
} 