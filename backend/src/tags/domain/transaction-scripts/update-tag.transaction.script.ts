import { Injectable, NotFoundException } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { UpdateTagDto } from '../../app/actions/update-tag-action/dtos/update-tag.dto';
import { Tag } from '../../domain/entities/tag.entity';

@Injectable()
export class UpdateTagTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(
    tagId: number,
    userId: number,
    updateTagDto: UpdateTagDto
  ): Promise<Tag> {
    const tag = await this.tagRepository.findTagByIdAndUserId(tagId, userId);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (updateTagDto.name !== undefined && updateTagDto.name !== null) {
      tag.name = updateTagDto.name;
    }

    if (updateTagDto.description !== undefined) {
      tag.description = updateTagDto.description || '';
    }

    return this.tagRepository.updateTag(tag);
  }
}
