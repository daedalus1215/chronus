import { Injectable, NotFoundException } from "@nestjs/common";
import { RemoveTagFromNoteDto } from "src/tags/app/actions/remove-tag-from-note-action/dtos/requests/remove-tag-from-note.dto";
import { TagNoteRepository } from "src/tags/infra/repositories/tag-note.repository";

@Injectable()
export class RemoveTagFromNoteTransactionScript {
  constructor(private readonly tagNoteRepository: TagNoteRepository) {}

  async apply(tagId: number, noteId: number, userId: number): Promise<void> {
    const deleted = await this.tagNoteRepository.deleteByNoteIdAndTagId(noteId, tagId, userId);
    if (!deleted) {
      throw new NotFoundException("Tag-note association not found or not owned by user");
    }
  }
}