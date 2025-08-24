import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TextToSpeechRequestDto, TextToSpeechResponseDto } from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class HermesRemoteCaller {
  private readonly hermesApiUrl: string;
  private readonly logger = new Logger(HermesRemoteCaller.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.hermesApiUrl = this.configService.get<string>('HERMES_API_URL');
    if (!this.hermesApiUrl) {
      throw new Error('HERMES_API_URL environment variable is not set');
    }
    this.logger.log(`Initialized with Hermes API URL: ${this.hermesApiUrl}`);
  }

  async convertTextToSpeech(request: TextToSpeechRequestDto & { userId: number }): Promise<TextToSpeechResponseDto> {
    const url = `${this.hermesApiUrl}text-to-speech`;
    this.logger.debug(`Making request to Hermes API: ${url}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post<TextToSpeechResponseDto>(url, {assetId: request.assetId.toString(), userId: request.userId.toString(), text: request})
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Hermes API error: ${error.message} - URL: ${url}`, error.stack);
        if (error.response?.status === 404) {
          throw new HttpException(
            'Hermes API endpoint not found. Please check the HERMES_API_URL configuration.',
            HttpStatus.NOT_FOUND
          );
        }
      }
      throw error;
    }
  }

  async downloadAudio(userId: number, assetId: string): Promise<AudioResponse> {
    const url = `${this.hermesApiUrl}download/${userId}/${assetId}`;
    const response = await firstValueFrom(
      this.httpService.get(url, { responseType: 'arraybuffer' })
    );
    
    const headers: { [key: string]: string } = {};
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(', ');
      }
    });
    
    return {
      data: response.data,
      headers,
    };
  }
}
