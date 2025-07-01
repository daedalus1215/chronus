import { Injectable, NotFoundException } from "@nestjs/common";
import { NoteMemoTagRepository } from "../../infra/repositories/note-memo-tag.repository";
import { AddTagToNoteDto } from "src/notes/apps/dtos/requests/add-tag-to-note.dto";
import { NoteResponseDto } from "src/notes/apps/dtos/responses/note.response.dto";
import { Tag } from "../entities/tag/tag.entity";

@Injectable()
export class AddTagToNoteTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(dto: AddTagToNoteDto & { userId: string }): Promise<NoteResponseDto> {
    const { noteId, userId } = dto;
    const note = await this.noteRepository.addTagToNote(
      noteId,
      await this.fetchTagByIdOrName(dto),
      userId
    );
    return new NoteResponseDto(note);
  }

  private async fetchTagByIdOrName({
    tagId,
    tagName,
    userId,
  }: AddTagToNoteDto & { userId: string }): Promise<Tag | null> {
    if (tagId) {
      return await this.noteRepository.tagRepository.findOne({
        where: { id: tagId, userId },
      });
    }
    if (tagName) {
      const foundTag = await this.noteRepository.findTagByName(tagName, userId);
      if (foundTag) return foundTag;
      return await this.noteRepository.createTag({ name: tagName, userId });
    }
    throw new NotFoundException("Tag not found or could not be created");
  }
}
