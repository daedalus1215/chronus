import { Injectable } from '@nestjs/common';
import { NoteAudio } from '../../entities/note-audio.entity';
import { NoteAudioRepository } from '../../../infrastructure/repositories/note-audio.repository';

@Injectable()
export class GetNoteAudiosTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async execute(noteId: number): Promise<NoteAudio[]> {
    const audios = await this.noteAudioRepository.findByNoteId(noteId);
    // Repository already returns them sorted by createdAt DESC
    return audios;
  }
}
