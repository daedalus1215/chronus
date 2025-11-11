import { Injectable } from '@nestjs/common';
import { TextToSpeechRequestDto, TextToSpeechResponseDto } from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { TextToSpeechTransactionScript } from '../transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from '../transaction-scripts/download-audio.transaction.script';
import { NoteAggregator } from 'src/notes/domain/aggregators/note.aggregator';

@Injectable()
export class AudioService {
  constructor(
    private readonly textToSpeechTS: TextToSpeechTransactionScript,
    private readonly downloadAudioTS: DownloadAudioTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async convertTextToSpeech(request: TextToSpeechRequestDto & { userId: number }): Promise<TextToSpeechResponseDto> {
    const note = await this.noteAggregator.getMemoById(request.assetId, request.userId);
    return this.textToSpeechTS.execute({...request, text: note.memo.description});
  }

  async downloadAudio(userId: number, assetId: string): Promise<AudioResponse> {
    return this.downloadAudioTS.execute(userId, assetId);
  }
}
