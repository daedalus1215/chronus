import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

@Injectable()
export class DeleteNoteTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(noteId: number, userId: number): Promise<void> {
    await this.noteRepository.deleteNoteById(noteId, userId);
  }
}
