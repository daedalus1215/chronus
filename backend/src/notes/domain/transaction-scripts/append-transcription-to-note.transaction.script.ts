import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { Note } from '../entities/notes/note.entity';

@Injectable()
export class AppendTranscriptionToNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
  ) {}

  async apply(
    noteId: number,
    userId: number,
    transcription: string,
  ): Promise<Note> {
    const note = await this.noteRepository.findById(noteId, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (!note.memo) {
      throw new NotFoundException('Note is not a memo');
    }

    // Append transcription to existing description
    const currentDescription = note.memo.description || '';
    const separator = currentDescription ? ' ' : '';
    const updatedDescription = `${currentDescription}${separator}${transcription}`;

    note.memo.description = updatedDescription;

    return await this.noteRepository.save(note);
  }
}

