import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { UpdateNoteTitleCommand } from './update-note-title.command';

@Injectable()
export class UpdateNoteTitleTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(
    id: number,
    command: UpdateNoteTitleCommand,
    userId: number
  ): Promise<{ id: number; name: string }> {
    const note = await this.noteRepository.findById(id, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    note.name = command.name;
    const updatedNote = await this.noteRepository.save(note);
    return {
      ...updatedNote,
    };
  }
}
