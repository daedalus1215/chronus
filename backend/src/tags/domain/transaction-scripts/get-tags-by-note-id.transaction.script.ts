import { Injectable } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { TagResponseDto } from '../../app/dtos/responses/tag.response.dto';

@Injectable()
export class GetTagsByNoteIdTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(noteId: number): Promise<TagResponseDto[]> {
    return (await this.tagRepository.findTagsByNoteId(noteId)).map(
      tag => new TagResponseDto(tag)
    );
  }
}
