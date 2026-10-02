import { Injectable, NotFoundException } from '@nestjs/common';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';

@Injectable()
export class DeleteTagTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(tagId: number, userId: number): Promise<void> {
    const tag = await this.tagRepository.findTagByIdAndUserId(tagId, userId);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // tag_notes.tag_id is ON DELETE NO ACTION — clear the associations first,
    // otherwise the tag row delete fails with a foreign key violation.
    await this.tagRepository.removeTagAssociations(tagId);
    await this.tagRepository.removeTag(tag);
  }
}
