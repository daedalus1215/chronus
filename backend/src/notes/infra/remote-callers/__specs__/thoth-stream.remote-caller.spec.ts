import { ConfigService } from '@nestjs/config';
import type { AddressInfo } from 'net';
import type { IncomingMessage } from 'http';
import { WebSocketServer, type WebSocket as WsSocket } from 'ws';
import { createMock } from 'src/shared-kernel/test-utils';
import { ThothStreamRemoteCaller } from '../thoth-stream.remote-caller';

/** Stands in for thoth's /stream-audio endpoint. */
class FakeThoth {
  readonly server: WebSocketServer;
  readonly receivedChunks: Buffer[] = [];
  readonly handshakeHeaders: IncomingMessage['headers'][] = [];
  private socket: WsSocket | null = null;

  private constructor(server: WebSocketServer) {
    this.server = server;
    this.server.on('connection', (socket, request) => {
      this.socket = socket;
      this.handshakeHeaders.push(request.headers);
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

  emit(payload: unknown): void {
    this.socket?.send(JSON.stringify(payload));
  }

  dropConnection(): void {
    this.socket?.close();
  }

  async stop(): Promise<void> {
    for (const client of this.server.clients) {
      client.terminate();
    }
    await new Promise<void>(resolve => this.server.close(() => resolve()));
  }
}

const buildTarget = (url: string) =>
  new ThothStreamRemoteCaller(
    createMock<ConfigService>({
      get: jest.fn((key: string) => (key === 'THOTH_WS_URL' ? url : undefined)),
    })
  );

const noopHandlers = {
  onTranscription: jest.fn(),
  onError: jest.fn(),
  onClose: jest.fn(),
};

describe('ThothStreamRemoteCaller', () => {
  let thoth: FakeThoth;
  let target: ThothStreamRemoteCaller;

  beforeEach(async () => {
    jest.clearAllMocks();
    thoth = await FakeThoth.start();
    target = buildTarget(thoth.url);
  });

  afterEach(async () => {
    await thoth.stop();
  });

  it('still constructs when THOTH_WS_URL is missing, so the backend can boot', () => {
    // Deployment copies a fixed .env onto the host. A dropped variable must
    // disable transcription only — not stop notes, tags, and time tracking.
    expect(() => buildTarget(undefined as unknown as string)).not.toThrow();
  });

  it('rejects every open() when THOTH_WS_URL is missing', async () => {
    const unconfigured = buildTarget(undefined as unknown as string);

    await expect(unconfigured.open({ ...noopHandlers })).rejects.toThrow(
      'THOTH_WS_URL is not set'
    );
  });

  it('relays binary chunks upstream byte for byte', async () => {
    const handle = await target.open({ ...noopHandlers });
    const chunk = Buffer.from(new Float32Array([0.1, -0.2, 0.3]).buffer);

    handle.send(chunk);
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(thoth.receivedChunks).toHaveLength(1);
    expect(thoth.receivedChunks[0].equals(chunk)).toBe(true);
    handle.close();
  });

  it('sends no Origin header — thoth rejects handshakes that carry one', async () => {
    const handle = await target.open({ ...noopHandlers });

    expect(thoth.handshakeHeaders[0].origin).toBeUndefined();
    handle.close();
  });

  it('surfaces transcription text from thoth', async () => {
    const onTranscription = jest.fn();
    const handle = await target.open({ ...noopHandlers, onTranscription });

    thoth.emit({ transcription: '  hello there  ' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onTranscription).toHaveBeenCalledWith('hello there');
    handle.close();
  });

  it('ignores frames that are not transcriptions', async () => {
    const onTranscription = jest.fn();
    const handle = await target.open({ ...noopHandlers, onTranscription });

    thoth.emit({ transcription: '   ' });
    thoth.emit({ status: 'ok' });
    thoth.emit({ transcription: 42 });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onTranscription).not.toHaveBeenCalled();
    handle.close();
  });

  it('rejects when thoth is unreachable', async () => {
    const unreachable = buildTarget('ws://localhost:1');

    await expect(unreachable.open({ ...noopHandlers })).rejects.toThrow(
      'Transcription service unavailable'
    );
  });

  it('reports upstream close without reconnecting', async () => {
    const onClose = jest.fn();
    await target.open({ ...noopHandlers, onClose });

    thoth.dropConnection();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onClose).toHaveBeenCalledTimes(1);
    // A reconnect would splice unrelated audio into one Whisper window,
    // because thoth resets its shared buffer on disconnect.
    expect(thoth.server.clients.size).toBe(0);
  });
});
