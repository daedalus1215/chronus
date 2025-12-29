import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';

type TranscriptionCallback = (transcription: string) => void;
type ErrorCallback = (error: Error) => void;

@Injectable()
export class ThothWebSocketClientService implements OnModuleDestroy {
  private readonly thothWsUrl: string;
  private readonly logger = new Logger(ThothWebSocketClientService.name);
  private ws: WebSocket | null = null;
  private transcriptionCallback: TranscriptionCallback | null = null;
  private errorCallback: ErrorCallback | null = null;

  constructor(private readonly configService: ConfigService) {
    this.thothWsUrl = this.configService.get<string>('THOTH_WS_URL');
    if (!this.thothWsUrl) {
      throw new Error('THOTH_WS_URL environment variable is not set');
    }
    // Remove any trailing slashes
    this.thothWsUrl = this.thothWsUrl.replace(/\/+$/, '');
    this.logger.log(`Initialized with Thoth WebSocket URL: ${this.thothWsUrl}`);
  }

  async connect(
    onTranscription: TranscriptionCallback,
    onError: ErrorCallback,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.thothWsUrl}/stream-audio`;
        this.logger.log(`Connecting to Thoth WebSocket: ${wsUrl}`);

        this.ws = new WebSocket(wsUrl);

        this.transcriptionCallback = onTranscription;
        this.errorCallback = onError;

        this.ws.on('open', () => {
          this.logger.log('Connected to Thoth WebSocket');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.transcription && this.transcriptionCallback) {
              this.transcriptionCallback(message.transcription);
            }
          } catch (error) {
            this.logger.error('Error parsing transcription message:', error);
            if (this.errorCallback) {
              this.errorCallback(
                error instanceof Error
                  ? error
                  : new Error('Failed to parse transcription message'),
              );
            }
          }
        });

        this.ws.on('error', (error: Error) => {
          this.logger.error('Thoth WebSocket error:', error);
          if (this.errorCallback) {
            this.errorCallback(error);
          }
          reject(error);
        });

        this.ws.on('close', () => {
          this.logger.log('Thoth WebSocket connection closed');
          this.ws = null;
        });
      } catch (error) {
        this.logger.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  sendAudioChunk(chunk: Buffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('WebSocket not connected, cannot send audio chunk');
      return;
    }

    try {
      this.ws.send(chunk);
    } catch (error) {
      this.logger.error('Error sending audio chunk:', error);
      if (this.errorCallback) {
        this.errorCallback(
          error instanceof Error
            ? error
            : new Error('Failed to send audio chunk'),
        );
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.logger.log('Disconnecting from Thoth WebSocket');
      this.ws.close();
      this.ws = null;
    }
    this.transcriptionCallback = null;
    this.errorCallback = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  onModuleDestroy(): void {
    this.disconnect();
  }
}

