import { Injectable } from '@nestjs/common';
import { NoteAudioRepository } from '../../../infra/repositories/note-audio.repository';

@Injectable()
export class DeleteNoteAudiosTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async execute(noteId: number): Promise<void> {
    await this.noteAudioRepository.deleteByNoteId(noteId);
  }
}
