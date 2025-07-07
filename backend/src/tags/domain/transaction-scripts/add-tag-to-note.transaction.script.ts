import { Injectable, NotFoundException } from "@nestjs/common";
import { TagRepository } from "../../infra/repositories/tag.repository";
import { AddTagToNoteDto } from "../../app/dtos/requests/add-tag-to-note.dto";
import { Tag } from "../../domain/entities/tag.entity";

/**
 * Transaction script to add a tag to a note.
 */
@Injectable()
export class AddTagToNoteTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(dto: AddTagToNoteDto & { userId: string }): Promise<Tag> {
    const { noteId, userId } = dto;
    const tag = await this.fetchTagByIdOrName(dto, userId);
    await this.tagRepository.addTagToNote(noteId, tag.id);
    return tag;
  }

  private async fetchTagByIdOrName(dto: AddTagToNoteDto, userId: string): Promise<Tag> {
    if (dto.tagId) {
      const tag = await this.tagRepository.findTagByIdAndUserId(dto.tagId, userId);
      if (tag) return tag;
    }
    if (dto.tagName) {
      let tag = await this.tagRepository.findTagByName(dto.tagName, userId);
      if (tag) return tag;
      tag = await this.tagRepository.createTag({ name: dto.tagName, userId });
      if (tag) return tag;
    }
    throw new NotFoundException("Tag not found or could not be created");
  }
} 