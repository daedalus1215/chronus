import { Injectable } from '@nestjs/common';
import { NoteAudioRepository } from '../../../infrastructure/repositories/note-audio.repository';

@Injectable()
export class UpdatePlaybackPositionTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async apply(
    audioId: number,
    positionSeconds: number,
    durationSeconds?: number
  ): Promise<void> {
    await this.noteAudioRepository.updatePositionById(
      audioId,
      positionSeconds,
      durationSeconds
    );
  }
}
