import { Injectable } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag.repository';
import { TagResponseDto } from '../../app/dtos/responses/tag.response.dto';

/**
 * Transaction script to get tags by user ID.
 */
@Injectable()
export class GetTagsByUserIdTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.getTagsByUserId(userId);
    return tags.map(tag => new TagResponseDto(tag));
  }
} 