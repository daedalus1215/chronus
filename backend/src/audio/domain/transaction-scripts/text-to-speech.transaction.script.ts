import { Injectable } from '@nestjs/common';
import {
  TextToSpeechRequestDto,
  TextToSpeechResponseDto,
} from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { HermesRemoteCaller } from '../../infrastructure/remote-callers/hermes.remote-caller';

export type TextToSpeechResult = {
  file_path: string;
  file_name: string;
  fileFormat: string;
};

@Injectable()
export class TextToSpeechTransactionScript {
  constructor(private readonly hermesRemoteCaller: HermesRemoteCaller) {}

  async execute(
    request: TextToSpeechRequestDto & { userId: number; text: string }
  ): Promise<TextToSpeechResult> {
    // Call Hermes to convert text to speech
    const hermesResponse =
      await this.hermesRemoteCaller.convertTextToSpeech(request);

    // Extract file format from the file path (e.g., "path/to/file.wav" -> "wav")
    const fileFormat = this.extractFileFormat(hermesResponse.file_path);

    return {
      file_path: hermesResponse.file_path,
      file_name: hermesResponse.file_name,
      fileFormat,
    };
  }

  private extractFileFormat(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'wav'; // Default to wav if no extension found
  }
}
