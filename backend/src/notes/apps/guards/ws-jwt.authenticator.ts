import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IncomingMessage } from 'http';

/**
 * Authenticates a WebSocket handshake from the `Sec-WebSocket-Protocol` header.
 *
 * This is deliberately NOT a CanActivate guard. Nest guards run on
 * `@SubscribeMessage` handlers, but the connection must be rejected in
 * `handleConnection` — before any audio is accepted — so this is a plain
 * injectable the gateway calls directly.
 *
 * Browsers cannot set an `Authorization` header on a WebSocket handshake, and
 * query params leak into access/proxy logs, so the token rides the subprotocol:
 *
 *   new WebSocket(url, ['chronus.jwt', '<token>'])
 *
 * See specs/transcription-gateway.md §6.3.
 */
export const WS_JWT_SUBPROTOCOL = 'chronus.jwt';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class WsJwtAuthenticator {
  private readonly logger = new Logger(WsJwtAuthenticator.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * @returns the authenticated userId, or null when the handshake carries no
   * usable token. Never throws — callers close the socket on null.
   */
  authenticate(request: IncomingMessage): number | null {
    const token = this.extractToken(request);
    if (!token) {
      return null;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      // jwt.strategy.ts maps `sub` to a string userId; NoteOwnershipPort wants
      // a number. Coerce once here and fail closed on anything non-numeric.
      const userId = Number(payload.sub);
      return Number.isInteger(userId) && userId > 0 ? userId : null;
    } catch (error) {
      this.logger.debug(
        `Rejected WebSocket handshake: ${(error as Error).message}`
      );
      return null;
    }
  }

  private extractToken(request: IncomingMessage): string | null {
    const header = request.headers['sec-websocket-protocol'];
    if (!header) {
      return null;
    }

    const protocols = (Array.isArray(header) ? header.join(',') : header)
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    if (protocols.length !== 2 || protocols[0] !== WS_JWT_SUBPROTOCOL) {
      return null;
    }

    return protocols[1];
  }
}
