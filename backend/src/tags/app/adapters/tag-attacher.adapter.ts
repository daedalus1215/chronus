import { Injectable } from '@nestjs/common';
import { TagAttacherPort } from '../../../note-transfer/domain/ports/tag-attacher.port';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { Tag } from '../../domain/entities/tag.entity';

/**
 * Adapter that implements TagAttacherPort using TagRepository.
 */
@Injectable()
export class TagAttacherAdapter implements TagAttacherPort {
  constructor(private readonly tagRepository: TagRepository) {}

  async attachByName(
    noteId: number,
    userId: number,
    tagNames: string[]
  ): Promise<void> {
    // Deduplicate tag names (case-insensitive)
    const uniqueNames = [...new Set(tagNames.map(n => n.toLowerCase()))];

    for (const tagName of uniqueNames) {
      // Find or create the tag
      let tag = await this.tagRepository.findTagByName(tagName, userId);

      if (!tag) {
        const newTag = new Tag();
        newTag.name = tagName;
        newTag.userId = userId;
        newTag.description = '';
        tag = await this.tagRepository.createTag(newTag);
      }

      // Check if already attached (the repository handles this, but we can optimize)
      const existingTags = await this.tagRepository.findTagsByNoteId(noteId);
      const alreadyAttached = existingTags.some(t => t.id === tag.id);

      if (!alreadyAttached) {
        await this.tagRepository.addTagToNote(noteId, tag.id);
      }
    }
  }
}
