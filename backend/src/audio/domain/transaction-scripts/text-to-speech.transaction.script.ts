import { Injectable } from "@nestjs/common";
import {
  TextToSpeechRequestDto,
  TextToSpeechResponseDto,
} from "src/audio/apps/dtos/requests/text-to-speech.dto";
import { HermesRemoteCaller } from "../../infrastructure/remote-callers/hermes.remote-caller";

@Injectable()
export class TextToSpeechTransactionScript {
  constructor(private readonly hermesRemoteCaller: HermesRemoteCaller) {}

  async execute(
    request: TextToSpeechRequestDto & { userId: number, text: string }
  ): Promise<TextToSpeechResponseDto> {
    return this.hermesRemoteCaller.convertTextToSpeech(request);
  }
}
