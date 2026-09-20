import { Injectable, NotFoundException } from '@nestjs/common';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class GetTagByIdTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(tagId: number, userId: number): Promise<Tag> {
    const tag = await this.tagRepository.findTagByIdAndUserId(tagId, userId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }
}
