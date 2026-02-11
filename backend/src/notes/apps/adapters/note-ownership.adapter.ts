import { Injectable } from '@nestjs/common';
import { NoteOwnershipPort } from 'src/audio/domain/ports/note-ownership.port';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

/**
 * Adapter that implements NoteOwnershipPort using NoteMemoTagRepository.
 * This allows the audio module to check note ownership without
 * directly depending on notes infrastructure.
 */
@Injectable()
export class NoteOwnershipAdapter implements NoteOwnershipPort {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async verifyOwnership(noteId: number, userId: number): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId, userId);
    return note !== null && note.userId === userId;
  }
}
