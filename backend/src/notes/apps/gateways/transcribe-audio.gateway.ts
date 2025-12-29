import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ThothWebSocketClientService } from '../../infra/remote-callers/thoth-websocket-client.service';
import { AppendTranscriptionToNoteTransactionScript } from '../../domain/transaction-scripts/append-transcription-to-note.transaction.script';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

interface JwtPayload {
  sub: string;
  username: string;
}

@WebSocketGateway({
  namespace: '/notes',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class TranscribeAudioGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TranscribeAudioGateway.name);
  private readonly clientConnections = new Map<
    string,
    {
      userId: number;
      noteId: number;
      thothClient: ThothWebSocketClientService;
      accumulatedTranscription: string;
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly appendTranscriptionTransactionScript: AppendTranscriptionToNoteTransactionScript,
    private readonly noteRepository: NoteMemoTagRepository,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from query params
      const token = client.handshake.query.token as string;
      const noteId = parseInt(
        client.handshake.query.noteId as string,
        10,
      );

      if (!token) {
        this.logger.warn('No token provided in WebSocket connection');
        client.disconnect();
        return;
      }

      if (!noteId || isNaN(noteId)) {
        this.logger.warn('Invalid noteId provided in WebSocket connection');
        client.disconnect();
        return;
      }

      // Verify JWT token
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify<JwtPayload>(token);
      } catch (error) {
        this.logger.warn('Invalid JWT token in WebSocket connection');
        client.disconnect();
        return;
      }

      const userId = parseInt(payload.sub, 10);
      if (isNaN(userId)) {
        this.logger.warn('Invalid user ID in JWT payload');
        client.disconnect();
        return;
      }

      // Verify note access
      const note = await this.noteRepository.findById(noteId, userId);
      if (!note) {
        this.logger.warn(
          `Note ${noteId} not found or user ${userId} doesn't have access`,
        );
        client.disconnect();
        return;
      }

      if (!note.memo) {
        this.logger.warn(`Note ${noteId} is not a memo`);
        client.disconnect();
        return;
      }

      // Create a new Thoth WebSocket client instance for this connection
      // Each connection needs its own Thoth client
      const thothClient = new ThothWebSocketClientService(this.configService);

      // Connect to Thoth backend
      await thothClient.connect(
        (transcription: string) => {
          // Forward transcription to client
          client.emit('transcription', { transcription });

          // Accumulate transcription
          const connection = this.clientConnections.get(client.id);
          if (connection) {
            const separator = connection.accumulatedTranscription ? ' ' : '';
            connection.accumulatedTranscription +=
              `${separator}${transcription}`;
          }
        },
        (error: Error) => {
          this.logger.error('Thoth WebSocket error:', error);
          client.emit('error', { message: error.message });
        },
      );

      // Store connection info
      this.clientConnections.set(client.id, {
        userId,
        noteId,
        thothClient,
        accumulatedTranscription: '',
      });

      this.logger.log(
        `Client ${client.id} connected for note ${noteId} (user ${userId})`,
      );
      client.emit('connected', { noteId });
    } catch (error) {
      this.logger.error('Error handling WebSocket connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const connection = this.clientConnections.get(client.id);

    if (connection) {
      this.logger.log(
        `Client ${client.id} disconnected from note ${connection.noteId}`,
      );

      // Disconnect from Thoth
      connection.thothClient.disconnect();

      // Save accumulated transcription to note
      if (connection.accumulatedTranscription.trim()) {
        try {
          await this.appendTranscriptionTransactionScript.apply(
            connection.noteId,
            connection.userId,
            connection.accumulatedTranscription,
          );
          this.logger.log(
            `Saved transcription to note ${connection.noteId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to save transcription to note ${connection.noteId}:`,
            error,
          );
        }
      }

      this.clientConnections.delete(client.id);
    }
  }

  @SubscribeMessage('audio-chunk')
  handleAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Buffer | ArrayBuffer,
  ) {
    const connection = this.clientConnections.get(client.id);

    if (!connection) {
      this.logger.warn(`No connection found for client ${client.id}`);
      return;
    }

    // Convert to Buffer if needed
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    // Forward audio chunk to Thoth backend
    connection.thothClient.sendAudioChunk(buffer);
  }
}

