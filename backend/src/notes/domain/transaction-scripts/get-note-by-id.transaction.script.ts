import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { Note } from '../entities/notes/note.entity';

@Injectable()
export class GetNoteByIdTransactionScript {
  constructor(private readonly noteTagRepository: NoteMemoTagRepository) {}

  async apply(id: number, userId: number): Promise<Note | null> {
    const note = await this.noteTagRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }
}
