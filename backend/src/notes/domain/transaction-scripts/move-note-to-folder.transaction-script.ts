import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/notes/note.entity';

@Injectable()
export class MoveNoteToFolderTransactionScript {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>
  ) {}

  async apply(
    noteId: number,
    userId: number,
    folderId: number | null
  ): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId, userId },
    });
    if (!note) throw new NotFoundException('Note not found');

    note.folderId = folderId;
    return this.noteRepository.save(note);
  }
}
