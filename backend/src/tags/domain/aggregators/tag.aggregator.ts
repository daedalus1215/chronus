import { Injectable } from '@nestjs/common';
import { GetTagsByNoteIdsTransactionScript } from '../transaction-scripts/get-tags-by-note-ids.transaction.script';
import { GetTagsByNoteIdTransactionScript } from '../transaction-scripts/get-tags-by-note-id.transaction.script';
import { TagAttacherPort } from '../../../note-transfer/domain/ports/tag-attacher.port';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagAggregator implements TagAttacherPort {
  constructor(
    private readonly getTagsByNoteIdsTS: GetTagsByNoteIdsTransactionScript,
    private readonly getTagsByNoteIdTS: GetTagsByNoteIdTransactionScript,
    private readonly tagRepository: TagRepository
  ) {}

  async getTagsByNoteIds(
    noteIds: number[]
  ): Promise<Map<number, { id: number; name: string }[]>> {
    return new Map(
      Array.from(await this.getTagsByNoteIdsTS.apply(noteIds)).map(
        ([noteId, tags]) => [
          noteId,
          tags.map(tag => ({ id: tag.id, name: tag.name })),
        ]
      )
    );
  }

  async getTagNamesByNoteId(noteId: number): Promise<string[]> {
    const tags = await this.getTagsByNoteIdTS.apply(noteId);
    return tags.map(tag => tag.name);
  }

  // TagAttacherPort implementation
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

      // Check if already attached
      const existingTags = await this.tagRepository.findTagsByNoteId(noteId);
      const alreadyAttached = existingTags.some(t => t.id === tag.id);

      if (!alreadyAttached) {
        await this.tagRepository.addTagToNote(noteId, tag.id);
      }
    }
  }
}
