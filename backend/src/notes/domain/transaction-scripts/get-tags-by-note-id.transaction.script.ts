import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { TagResponseDto } from 'src/notes/apps/dtos/responses/tag.response.dto';

@Injectable()
export class GetTagsByNoteIdTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(noteId: number, userId: string): Promise<TagResponseDto[]> {
    const tags = await this.noteRepository.findTagsByNoteId(noteId, userId);
    return tags.map(tag => new TagResponseDto(tag));
  }
} 