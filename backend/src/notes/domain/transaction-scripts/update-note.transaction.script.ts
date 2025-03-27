import { Injectable, NotFoundException } from "@nestjs/common";
import { Note } from "../entities/notes/note.entity";
import { Memo } from "../entities/notes/memo.entity";
import { UpdateNoteDto } from "src/notes/apps/dtos/requests/update-note.dto";
import { NoteTagRepository } from "../../infra/repositories/note-tag.repository";
import { NoteResponseDto } from "../../apps/dtos/responses/note.response.dto";

@Injectable()
export class UpdateNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteTagRepository
  ) {}

  async apply(id: number, updateNoteDto: UpdateNoteDto): Promise<NoteResponseDto> {
    let note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    if (updateNoteDto?.name) {
      note.name = updateNoteDto.name;
    }

    if (updateNoteDto?.description !== undefined) {
      // Create memo if it doesn't exist
      if (!note.memo) {
        note.memo = new Memo();
      }
      note.memo.description = updateNoteDto.description;
    }

    if (updateNoteDto?.tags) {
      const existingTags = note.tags.map((tag) => tag.name);

      const newTags = updateNoteDto.tags.filter(
        (tag) => !existingTags.includes(tag)
      );
      const tagsToRemove = existingTags.filter(
        (tag) => !updateNoteDto.tags.includes(tag)
      );

      await this.removeTags(tagsToRemove, note);
      await this.addTags(newTags, note);
    }

    const savedNote = await this.noteRepository.save(note);
    return new NoteResponseDto(savedNote);
  }

  private async addTags(newTags: string[], note: Note) {
    for (const tagName of newTags) {
      let tag = await this.noteRepository.findTagByName(tagName);
      if (!tag) {
        tag = await this.noteRepository.createTag({ name: tagName });
      }
      note.tags.push(tag);
    }
  }

  private async removeTags(tagsToRemove: string[], note: Note) {
    for (const tagName of tagsToRemove) {
      const tagToRemove = note.tags.find((tag) => tag.name === tagName);
      if (tagToRemove) {
        note.tags = note.tags.filter((tag) => tag !== tagToRemove);
        await this.noteRepository.removeTag(tagToRemove);
      }
    }
  }
}
