import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from '../../entities/notes/note.entity';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

@Injectable()
export class PinNoteTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(noteId: number, userId: number, pinned: boolean): Promise<Note> {
    const note = await this.noteRepository.findById(noteId, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.updatePinned(noteId, userId, pinned);

    note.pinned = pinned;
    note.pinnedAt = pinned ? new Date() : null;
    return note;
  }
}
