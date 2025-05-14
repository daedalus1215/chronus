import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';

@Injectable()
export class GetNoteByIdTransactionScript {
  constructor(private readonly noteTagRepository: NoteMemoTagRepository) {}

  async apply(id: number, userId: string): Promise<NoteResponseDto> {
    const note = await this.noteTagRepository.findById(id, userId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return new NoteResponseDto(note);
  }
} 