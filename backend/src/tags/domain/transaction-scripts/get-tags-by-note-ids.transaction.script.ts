import { Injectable } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { TagResponseDto } from '../../app/dtos/responses/tag.response.dto';

@Injectable()
export class GetTagsByNoteIdsTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(noteIds: number[]): Promise<Map<number, TagResponseDto[]>> {
    if (noteIds.length === 0) {
      return new Map();
    }

    const tags = await this.tagRepository.findTagsByNoteIds(noteIds);
    return new Map(
      Array.from(tags).map(([noteId, tags]) => [
        noteId,
        tags.map(tag => new TagResponseDto(tag)),
      ])
    );
  }
}
