import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'net';
import { WebSocket, WebSocketServer, type WebSocket as WsSocket } from 'ws';
import {
  NOTE_OWNERSHIP_PORT,
  NoteOwnershipPort,
} from 'src/audio/domain/ports/note-ownership.port';
import { createMock } from 'src/shared-kernel/test-utils';
import { ThothStreamRemoteCaller } from '../../../infra/remote-callers/thoth-stream.remote-caller';
import { WsJwtAuthenticator } from '../../guards/ws-jwt.authenticator';
import {
  TRANSCRIBE_CLOSE_CODES,
  TranscribeAudioGateway,
} from '../transcribe-audio.gateway';
import { TranscriptionSessionRegistry } from '../transcription-session.registry';

const OWNER_ID = 7;
const OWNED_NOTE_ID = 123;
const MAX_SESSION_MS = 400;

type CloseEvent = { code: number; reason: string };

/** Stands in for thoth's /stream-audio endpoint. */
class FakeThoth {
  readonly server: WebSocketServer;
  readonly receivedChunks: Buffer[] = [];
  sockets: WsSocket[] = [];

  private constructor(server: WebSocketServer) {
    this.server = server;
    this.server.on('connection', socket => {
      this.sockets.push(socket);
      socket.on('message', (data: Buffer) => this.receivedChunks.push(data));
    });
  }

  static async start(): Promise<FakeThoth> {
    const server = new WebSocketServer({ port: 0, path: '/stream-audio' });
    await new Promise<void>(resolve => server.once('listening', resolve));
    return new FakeThoth(server);
  }

  get url(): string {
    return `ws://localhost:${(this.server.address() as AddressInfo).port}`;
  }

  get openSocketCount(): number {
    return this.sockets.filter(s => s.readyState === WebSocket.OPEN).length;
  }

  emit(text: string): void {
    this.sockets.at(-1)?.send(JSON.stringify({ transcription: text }));
  }

  killUpstream(): void {
    this.sockets.at(-1)?.close();
  }

  async stop(): Promise<void> {
    for (const client of this.server.clients) {
      client.terminate();
    }
    await new Promise<void>(resolve => this.server.close(() => resolve()));
  }
}

const settle = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

describe('TranscribeAudioGateway', () => {
  let app: INestApplication;
  let thoth: FakeThoth;
  let registry: TranscriptionSessionRegistry;
  let ownershipMock: jest.Mocked<NoteOwnershipPort>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let baseUrl: string;
  const openClients: WebSocket[] = [];

  beforeEach(async () => {
    thoth = await FakeThoth.start();

    ownershipMock = createMock<NoteOwnershipPort>({
      verifyOwnership: jest
        .fn()
        .mockImplementation(
          async (noteId: number, userId: number) =>
            noteId === OWNED_NOTE_ID && userId === OWNER_ID
        ),
    });

    jwtServiceMock = createMock<JwtService>({
      verify: jest.fn().mockImplementation((token: string) => {
        if (token !== 'good.token') {
          throw new Error('invalid token');
        }
        return { sub: String(OWNER_ID), username: 'ada' };
      }),
    });

    const configServiceMock = createMock<ConfigService>({
      get: jest.fn((key: string) => {
        if (key === 'THOTH_WS_URL') return thoth.url;
        if (key === 'TRANSCRIPTION_MAX_SESSION_MS')
          return String(MAX_SESSION_MS);
        if (key === 'TRANSCRIPTION_MAX_SESSIONS_PER_USER') return '1';
        return undefined;
      }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TranscribeAudioGateway,
        TranscriptionSessionRegistry,
        WsJwtAuthenticator,
        ThothStreamRemoteCaller,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: NOTE_OWNERSHIP_PORT, useValue: ownershipMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(0);

    registry = moduleRef.get(TranscriptionSessionRegistry);
    const port = (app.getHttpServer().address() as AddressInfo).port;
    baseUrl = `ws://localhost:${port}/api/notes/transcribe-audio`;
  });

  afterEach(async () => {
    for (const client of openClients) {
      client.terminate();
    }
    openClients.length = 0;
    await app.close();
    await thoth.stop();
  });

  const connect = (
    { noteId, token }: { noteId?: number | string; token?: string } = {
      noteId: OWNED_NOTE_ID,
      token: 'good.token',
    }
  ) => {
    const url = noteId === undefined ? baseUrl : `${baseUrl}?noteId=${noteId}`;
    const client =
      token === undefined
        ? new WebSocket(url)
        : new WebSocket(url, ['chronus.jwt', token]);
    openClients.push(client);

    const messages: Record<string, unknown>[] = [];
    let closeEvent: CloseEvent | null = null;

    client.on('message', raw => messages.push(JSON.parse(raw.toString())));
    client.on('close', (code, reason) => {
      closeEvent = { code, reason: reason.toString() };
    });
    client.on('error', () => undefined);

    return {
      client,
      messages,
      get close(): CloseEvent | null {
        return closeEvent;
      },
      waitForReady: async () => {
        for (let i = 0; i < 50; i += 1) {
          if (messages.some(m => m.type === 'ready')) return;
          await settle(20);
        }
        throw new Error(`never became ready; got ${JSON.stringify(messages)}`);
      },
    };
  };

  describe('rejections', () => {
    it('closes 4401 when no token is offered', async () => {
      const session = connect({ noteId: OWNED_NOTE_ID, token: undefined });
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.UNAUTHORIZED);
    });

    it('closes 4401 for an invalid or expired token', async () => {
      const session = connect({
        noteId: OWNED_NOTE_ID,
        token: 'expired.token',
      });
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.UNAUTHORIZED);
    });

    it('closes 4404 when noteId is missing', async () => {
      const session = connect({ noteId: undefined, token: 'good.token' });
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.NOTE_NOT_FOUND);
    });

    it('closes 4404 when noteId is not a number', async () => {
      const session = connect({ noteId: 'abc', token: 'good.token' });
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.NOTE_NOT_FOUND);
    });

    it('closes 4403 for a note the user does not own', async () => {
      const session = connect({ noteId: 999, token: 'good.token' });
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.FORBIDDEN);
    });

    it('closes 4409 for a second concurrent session by the same user', async () => {
      const first = connect();
      await first.waitForReady();

      const second = connect();
      await settle();

      expect(second.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.ALREADY_STREAMING);
      expect(first.close).toBeNull();
    });

    it('never opens an upstream socket for a rejected connection', async () => {
      connect({ noteId: 999, token: 'good.token' });
      connect({ noteId: OWNED_NOTE_ID, token: 'bad.token' });
      await settle();

      expect(thoth.sockets).toHaveLength(0);
      expect(registry.activeSessionCount()).toBe(0);
    });
  });

  describe('streaming', () => {
    it('relays audio upstream and transcriptions downstream', async () => {
      const session = connect();
      await session.waitForReady();

      const chunk = Buffer.from(new Float32Array([0.5, -0.5]).buffer);
      session.client.send(chunk);
      await settle();
      thoth.emit('hello world');
      await settle();

      expect(thoth.receivedChunks).toHaveLength(1);
      expect(thoth.receivedChunks[0].equals(chunk)).toBe(true);
      expect(session.messages).toContainEqual({
        type: 'transcription',
        text: 'hello world',
      });
    });

    it('does not relay text frames upstream', async () => {
      const session = connect();
      await session.waitForReady();

      session.client.send(JSON.stringify({ type: 'stop' }));
      await settle();

      expect(thoth.receivedChunks).toHaveLength(0);
    });

    it('closes 1011 and reports an error when thoth drops the stream', async () => {
      const session = connect();
      await session.waitForReady();

      thoth.killUpstream();
      await settle();

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.UPSTREAM_FAILURE);
    });

    it('closes 4408 once the session duration cap is hit', async () => {
      const session = connect();
      await session.waitForReady();

      await settle(MAX_SESSION_MS + 200);

      expect(session.close?.code).toBe(TRANSCRIBE_CLOSE_CODES.SESSION_EXPIRED);
    });
  });

  describe('resource release', () => {
    it.each([
      ['client closes cleanly', async (client: WebSocket) => client.close()],
      [
        'client vanishes abruptly',
        async (client: WebSocket) => client.terminate(),
      ],
    ])(
      'releases the claim and upstream socket when %s',
      async (_label, end) => {
        const session = connect();
        await session.waitForReady();
        expect(registry.activeSessionCount()).toBe(1);

        await end(session.client);
        await settle();

        expect(registry.activeSessionCount()).toBe(0);
        expect(thoth.openSocketCount).toBe(0);
      }
    );

    it('lets the user reconnect after a session ends', async () => {
      const first = connect();
      await first.waitForReady();
      first.client.close();
      await settle();

      const second = connect();
      await second.waitForReady();

      expect(second.close).toBeNull();
    });

    it('releases the claim when the duration cap fires', async () => {
      const session = connect();
      await session.waitForReady();

      await settle(MAX_SESSION_MS + 200);

      expect(registry.activeSessionCount()).toBe(0);
      expect(thoth.openSocketCount).toBe(0);
    });

    it('releases the claim when thoth drops the stream', async () => {
      const session = connect();
      await session.waitForReady();

      thoth.killUpstream();
      await settle();

      expect(registry.activeSessionCount()).toBe(0);
    });
  });

  it('performs no note writes — the editor owns the text', async () => {
    // Guards against reintroducing a server-side append, which would create the
    // lost-update race described in specs/transcription-gateway.md §2.1.
    const session = connect();
    await session.waitForReady();
    thoth.emit('some transcribed words');
    await settle();
    session.client.close();
    await settle();

    expect(ownershipMock.verifyOwnership).toHaveBeenCalledTimes(1);
    expect(session.messages.map(m => m.type)).toEqual([
      'ready',
      'transcription',
    ]);
  });
});
