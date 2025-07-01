import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { TagResponseDto } from 'src/notes/apps/dtos/responses/tag.response.dto';

@Injectable()
export class GetTagsByUserIdTransactionScript {
  constructor(private readonly noteMemoTagRepository: NoteMemoTagRepository) {}

  async apply(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.noteMemoTagRepository.getTagsByUserId(userId);
    return tags.map(tag => new TagResponseDto(tag));
  }
} 