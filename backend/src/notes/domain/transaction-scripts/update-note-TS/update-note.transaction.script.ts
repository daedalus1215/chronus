import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateNoteDto } from "src/notes/apps/dtos/requests/update-note.dto";
import { NoteMemoTagRepository } from "../../../infra/repositories/note-memo-tag.repository";
import { NoteResponseDto } from "../../../apps/dtos/responses/note.response.dto";
import { NoteDtoToEntityConverter } from "./note-dto-to-entity.converter";

@Injectable()
export class UpdateNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly noteDtoToEntityConverter: NoteDtoToEntityConverter
  ) {}

  async apply(id: number, updateNoteDto: UpdateNoteDto, userId: number): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    const updatedNote = await this.noteRepository.save(this.noteDtoToEntityConverter.apply(updateNoteDto, note));
    return {
      ...updatedNote,
      checkItems: updatedNote.checkItems,
      isMemo: updatedNote.memo !== null,
    };
  }
}
