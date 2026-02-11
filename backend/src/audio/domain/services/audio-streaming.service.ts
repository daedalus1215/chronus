import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { StreamAudioTransactionScript } from '../transaction-scripts/stream-audio-ts/stream-audio.transaction.script';

@Injectable()
export class AudioStreamingService {
  constructor(
    private readonly streamAudioTransactionScript: StreamAudioTransactionScript
  ) {}

  async streamAudio(
    audioId: number,
    userId: number,
    rangeHeader: string | undefined,
    res: Response
  ): Promise<void> {
    return this.streamAudioTransactionScript.apply(
      audioId,
      userId,
      rangeHeader,
      res
    );
  }
}
