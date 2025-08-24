import { Injectable } from '@nestjs/common';
import { TextToSpeechRequestDto, TextToSpeechResponseDto } from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { TextToSpeechTransactionScript } from '../transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from '../transaction-scripts/download-audio.transaction.script';

@Injectable()
export class AudioService {
  constructor(
    private readonly textToSpeechTS: TextToSpeechTransactionScript,
    private readonly downloadAudioTS: DownloadAudioTransactionScript,
  ) {}

  async convertTextToSpeech(request: TextToSpeechRequestDto & { userId: number }): Promise<TextToSpeechResponseDto> {
    return this.textToSpeechTS.execute(request);
  }

  async downloadAudio(userId: number, assetId: string): Promise<AudioResponse> {
    return this.downloadAudioTS.execute(userId, assetId);
  }
}
