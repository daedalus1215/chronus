import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteTagRepository } from '../../infra/repositories/note-tag.repository';
import { NoteResponseDto } from 'src/notes/apps/dtos/responses/note.response.dto';

@Injectable()
export class GetNoteByIdTransactionScript {
  constructor(private readonly noteTagRepository: NoteTagRepository) {}

  async apply(id: number): Promise<NoteResponseDto> {
    const note = await this.noteTagRepository.findById(id);
    
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return new NoteResponseDto(note);
  }
} 