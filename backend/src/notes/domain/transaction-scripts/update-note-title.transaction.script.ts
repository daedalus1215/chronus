import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { UpdateNoteTitleDto } from 'src/notes/apps/dtos/requests/update-note-title.dto';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';

@Injectable()
export class UpdateNoteTitleTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(id: number, updateNoteTitleDto: UpdateNoteTitleDto, userId: string): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findById(id, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    note.name = updateNoteTitleDto.name;
    const updatedNote = await this.noteRepository.save(note);
    return {
      ...updatedNote,
      checkItems: updatedNote.checkItems,
      isMemo: updatedNote.memo !== null,
    };
  }
} 