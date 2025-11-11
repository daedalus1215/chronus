import { Injectable } from '@nestjs/common';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { HermesRemoteCaller } from '../../infrastructure/remote-callers/hermes.remote-caller';

@Injectable()
export class DownloadAudioTransactionScript {
  constructor(private readonly hermesRemoteCaller: HermesRemoteCaller) {}

  async execute(userId: number, assetId: string): Promise<AudioResponse> {
    return this.hermesRemoteCaller.downloadAudio(userId, assetId);
  }
}
