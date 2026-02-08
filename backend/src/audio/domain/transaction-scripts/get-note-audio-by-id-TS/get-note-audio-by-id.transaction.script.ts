import { Injectable } from '@nestjs/common';
import { NoteAudio } from '../../entities/note-audio.entity';
import { NoteAudioRepository } from '../../../infra/repositories/note-audio.repository';

@Injectable()
export class GetNoteAudioByIdTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async execute(audioId: number): Promise<NoteAudio | null> {
    const audio = await this.noteAudioRepository.findById(audioId);
    return audio;
  }
}
