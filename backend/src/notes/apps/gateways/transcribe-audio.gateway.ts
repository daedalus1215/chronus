import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import type { RawData, WebSocket } from 'ws';
import {
  NOTE_OWNERSHIP_PORT,
  NoteOwnershipPort,
} from 'src/audio/domain/ports/note-ownership.port';
import {
  ThothStreamHandle,
  ThothStreamRemoteCaller,
} from '../../infra/remote-callers/thoth-stream.remote-caller';
import {
  WS_JWT_SUBPROTOCOL,
  WsJwtAuthenticator,
} from '../guards/ws-jwt.authenticator';
import { TranscriptionSessionRegistry } from './transcription-session.registry';

/** Application close codes. See specs/transcription-gateway.md §5. */
export const TRANSCRIBE_CLOSE_CODES = {
  UNAUTHORIZED: 4401,
  FORBIDDEN: 4403,
  NOTE_NOT_FOUND: 4404,
  SESSION_EXPIRED: 4408,
  ALREADY_STREAMING: 4409,
  UPSTREAM_FAILURE: 1011,
} as const;

const DEFAULT_MAX_SESSION_MS = 30 * 60 * 1000;

type Session = {
  userId: number;
  noteId: number;
  startedAt: number;
  chunkCount: number;
  handle: ThothStreamHandle | null;
  timeout: NodeJS.Timeout | null;
};

/**
 * Authenticated proxy between the browser and thoth's `/stream-audio`.
 *
 * The browser no longer reaches thoth directly. This gateway validates the JWT,
 * verifies note ownership, caps concurrent sessions, and relays binary audio
 * frames upstream while returning transcriptions downstream.
 *
 * It performs NO database writes. The editor owns the note text and persists it
 * through the existing debounced save — see specs/transcription-gateway.md §2.1
 * for why, and do not reintroduce a server-side append without reading it.
 *
 * Note: the global `api` prefix from main.ts does not apply to gateways, and
 * gateway paths cannot carry route params, so `noteId` rides the query string.
 */
@WebSocketGateway({
  path: '/api/notes/transcribe-audio',
  handleProtocols: (protocols: Set<string>) =>
    protocols.has(WS_JWT_SUBPROTOCOL) ? WS_JWT_SUBPROTOCOL : false,
})
export class TranscribeAudioGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TranscribeAudioGateway.name);
  private readonly sessions = new Map<WebSocket, Session>();
  private readonly maxSessionMs: number;

  constructor(
    private readonly wsJwtAuthenticator: WsJwtAuthenticator,
    private readonly sessionRegistry: TranscriptionSessionRegistry,
    private readonly thothStream: ThothStreamRemoteCaller,
    private readonly configService: ConfigService,
    @Inject(NOTE_OWNERSHIP_PORT)
    private readonly noteOwnership: NoteOwnershipPort
  ) {
    this.maxSessionMs = Number(
      this.configService.get<string>('TRANSCRIPTION_MAX_SESSION_MS') ??
        DEFAULT_MAX_SESSION_MS
    );
  }

  async handleConnection(
    client: WebSocket,
    request: IncomingMessage
  ): Promise<void> {
    const userId = this.wsJwtAuthenticator.authenticate(request);
    if (userId === null) {
      this.reject(client, TRANSCRIBE_CLOSE_CODES.UNAUTHORIZED, 'Unauthorized');
      return;
    }

    const noteId = this.parseNoteId(request);
    if (noteId === null) {
      this.reject(
        client,
        TRANSCRIBE_CLOSE_CODES.NOTE_NOT_FOUND,
        'Missing or invalid noteId'
      );
      return;
    }

    const owns = await this.noteOwnership.verifyOwnership(noteId, userId);
    if (!owns) {
      this.reject(
        client,
        TRANSCRIBE_CLOSE_CODES.FORBIDDEN,
        'You do not have access to this note'
      );
      return;
    }

    if (!this.sessionRegistry.tryClaim(userId)) {
      this.reject(
        client,
        TRANSCRIBE_CLOSE_CODES.ALREADY_STREAMING,
        'A recording is already in progress'
      );
      return;
    }

    // From here on the claim is held, so every exit path must release it.
    const session: Session = {
      userId,
      noteId,
      startedAt: Date.now(),
      chunkCount: 0,
      handle: null,
      timeout: null,
    };
    this.sessions.set(client, session);

    try {
      session.handle = await this.thothStream.open({
        onTranscription: text =>
          this.sendJson(client, 'transcription', { text }),
        onError: error => {
          this.sendJson(client, 'error', {
            code: 'UPSTREAM_FAILURE',
            message: 'Transcription service error',
          });
          this.logger.error(
            `Upstream failure for user ${userId} on note ${noteId}: ${error.message}`
          );
          client.close(
            TRANSCRIBE_CLOSE_CODES.UPSTREAM_FAILURE,
            'Transcription service error'
          );
        },
        onClose: () =>
          client.close(
            TRANSCRIBE_CLOSE_CODES.UPSTREAM_FAILURE,
            'Transcription service closed the stream'
          ),
      });
    } catch (error) {
      this.logger.error(
        `Could not reach thoth for user ${userId}: ${(error as Error).message}`
      );
      this.sendJson(client, 'error', {
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'Transcription service unavailable',
      });
      this.teardown(client);
      client.close(
        TRANSCRIBE_CLOSE_CODES.UPSTREAM_FAILURE,
        'Transcription service unavailable'
      );
      return;
    }

    // The client may have vanished while we were connecting upstream.
    if (client.readyState !== client.OPEN) {
      this.teardown(client);
      return;
    }

    session.timeout = setTimeout(() => {
      this.logger.log(
        `Session for user ${userId} hit the ${this.maxSessionMs}ms cap`
      );
      client.close(
        TRANSCRIBE_CLOSE_CODES.SESSION_EXPIRED,
        'Maximum recording length reached'
      );
    }, this.maxSessionMs);

    client.on('message', (data: RawData, isBinary: boolean) => {
      if (!isBinary) {
        // Thoth's stream_audio calls receive_bytes() and raises on text frames,
        // so text is never relayed upstream. The client has no control protocol.
        this.logger.debug('Dropping non-binary frame from client');
        return;
      }
      session.chunkCount += 1;
      session.handle?.send(this.toBuffer(data));
    });

    this.logger.log(
      `Transcription session opened (user=${userId}, note=${noteId})`
    );
    this.sendJson(client, 'ready', {});
  }

  handleDisconnect(client: WebSocket): void {
    const session = this.sessions.get(client);
    if (!session) {
      return;
    }
    const durationMs = Date.now() - session.startedAt;
    this.teardown(client);
    this.logger.log(
      `Transcription session closed (user=${session.userId}, ` +
        `note=${session.noteId}, durationMs=${durationMs}, ` +
        `chunks=${session.chunkCount})`
    );
  }

  /**
   * Releases everything a session holds. Safe to call more than once.
   *
   * A leaked registry claim locks the user out until the process restarts, and a
   * leaked upstream socket leaves thoth transcribing a dead session — which,
   * given thoth's process-global buffer, blocks the next one too.
   */
  private teardown(client: WebSocket): void {
    const session = this.sessions.get(client);
    if (!session) {
      return;
    }
    this.sessions.delete(client);

    if (session.timeout) {
      clearTimeout(session.timeout);
    }
    session.handle?.close();
    this.sessionRegistry.release(session.userId);
  }

  private reject(client: WebSocket, code: number, reason: string): void {
    this.logger.warn(`Rejected transcription connection (${code}): ${reason}`);
    this.sendJson(client, 'error', { code: String(code), message: reason });
    client.close(code, reason);
  }

  private sendJson(
    client: WebSocket,
    type: string,
    payload: Record<string, unknown>
  ): void {
    if (client.readyState !== client.OPEN) {
      return;
    }
    client.send(JSON.stringify({ type, ...payload }));
  }

  private parseNoteId(request: IncomingMessage): number | null {
    if (!request.url) {
      return null;
    }
    const raw = new URL(
      request.url,
      `ws://${request.headers.host ?? 'localhost'}`
    ).searchParams.get('noteId');
    const noteId = Number(raw);
    return Number.isInteger(noteId) && noteId > 0 ? noteId : null;
  }

  private toBuffer(data: RawData): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (Array.isArray(data)) {
      return Buffer.concat(data);
    }
    return Buffer.from(data);
  }
}
