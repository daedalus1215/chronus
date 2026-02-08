import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  TextToSpeechRequestDto,
  TextToSpeechResponseDto,
} from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class HermesRemoteCaller {
  private readonly hermesApiUrl: string;
  private readonly logger = new Logger(HermesRemoteCaller.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.hermesApiUrl = this.configService.get<string>('HERMES_API_URL');
    if (!this.hermesApiUrl) {
      throw new Error('HERMES_API_URL environment variable is not set');
    }
    // Remove any trailing slashes from the base URL
    this.hermesApiUrl = this.hermesApiUrl.replace(/\/+$/, '');
    if (!this.hermesApiUrl.endsWith('/')) {
      this.hermesApiUrl += '/';
    }
    this.logger.log(`Initialized with Hermes API URL: ${this.hermesApiUrl}`);
  }

  private sanitizeText(text: string): string {
    return (
      text
        // Replace multiple newlines with a single space
        .replace(/(\r\n|\n|\r)+/g, ' ')
        // Replace multiple spaces with a single space
        .replace(/\s+/g, ' ')
        // Remove special characters that might cause issues with TTS
        .replace(/[^\w\s.,!?-]/g, '')
        // Normalize quotes and apostrophes
        .replace(/[''‛`]/g, "'")
        .replace(/[""‟]/g, '"')
        // Trim whitespace from beginning and end
        .trim()
    );
  }

  async convertTextToSpeech(
    request: TextToSpeechRequestDto & { userId: number; text: string }
  ): Promise<TextToSpeechResponseDto> {
    const url = `${this.hermesApiUrl}text-to-speech`;
    this.logger.debug(`Making request to Hermes API: ${url}`);
    try {
      const sanitizedText = this.sanitizeText(request.text);
      this.logger.debug(`Sanitized text: ${sanitizedText}`);

      // Log the request body for debugging
      const requestBody = {
        text: sanitizedText,
        userId: request.userId.toString(),
        assetId: request.assetId.toString(),
      };
      this.logger.debug('Request body:', requestBody);

      const response = await firstValueFrom(
        this.httpService.post<TextToSpeechResponseDto>(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Hermes API error: ${error.message} - URL: ${url}`);
        this.logger.error('Error response:', error.response?.data);

        if (error.response?.status === 404) {
          throw new HttpException(
            'Hermes API endpoint not found. Please check the HERMES_API_URL configuration.',
            HttpStatus.NOT_FOUND
          );
        } else if (error.response?.status === 500) {
          throw new HttpException(
            `Internal Server Error in Hermes API: ${error.response?.data?.detail || 'Unknown error'}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      this.logger.error('Unexpected error:', error);
      throw error;
    }
  }

  async downloadAudio(
    userId: number,
    assetId: string,
    fileName?: string
  ): Promise<AudioResponse> {
    const url = `${this.hermesApiUrl}download/${userId}/${assetId}`;
    const params = fileName ? { filename: fileName } : undefined;
    const response = await firstValueFrom(
      this.httpService.get(url, { responseType: 'arraybuffer', params })
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
