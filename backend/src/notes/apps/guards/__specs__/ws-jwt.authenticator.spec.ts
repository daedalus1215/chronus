import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import type { IncomingMessage } from 'http';
import { createMock } from 'src/shared-kernel/test-utils';
import { WsJwtAuthenticator } from '../ws-jwt.authenticator';

const requestWithProtocol = (protocol?: string): IncomingMessage =>
  ({
    headers:
      protocol === undefined ? {} : { 'sec-websocket-protocol': protocol },
  }) as unknown as IncomingMessage;

describe('WsJwtAuthenticator', () => {
  let target: WsJwtAuthenticator;
  let jwtServiceMock: jest.Mocked<JwtService>;

  beforeEach(async () => {
    jwtServiceMock = createMock<JwtService>({ verify: jest.fn() });

    const moduleRef = await Test.createTestingModule({
      providers: [
        WsJwtAuthenticator,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    target = moduleRef.get(WsJwtAuthenticator);
  });

  it('returns the userId for a valid token', () => {
    jwtServiceMock.verify.mockReturnValue({ sub: '42', username: 'ada' });

    const result = target.authenticate(
      requestWithProtocol('chronus.jwt, a.valid.token')
    );

    expect(result).toBe(42);
    expect(jwtServiceMock.verify).toHaveBeenCalledWith('a.valid.token');
  });

  it('returns null when the token is expired or otherwise invalid', () => {
    jwtServiceMock.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const result = target.authenticate(
      requestWithProtocol('chronus.jwt, expired.token')
    );

    expect(result).toBeNull();
  });

  it('returns null when no subprotocol header is present', () => {
    expect(target.authenticate(requestWithProtocol())).toBeNull();
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('returns null when the subprotocol name is wrong', () => {
    const result = target.authenticate(
      requestWithProtocol('some.other.protocol, a.valid.token')
    );

    expect(result).toBeNull();
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('returns null when the token segment is missing', () => {
    expect(target.authenticate(requestWithProtocol('chronus.jwt'))).toBeNull();
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('fails closed when sub is not a positive integer', () => {
    for (const sub of ['not-a-number', '0', '-3', '']) {
      jwtServiceMock.verify.mockReturnValue({ sub, username: 'ada' });

      expect(
        target.authenticate(requestWithProtocol('chronus.jwt, token'))
      ).toBeNull();
    }
  });

  it('tolerates the header arriving as an array', () => {
    jwtServiceMock.verify.mockReturnValue({ sub: '7', username: 'ada' });
    const request = {
      headers: { 'sec-websocket-protocol': ['chronus.jwt', 'token'] },
    } as unknown as IncomingMessage;

    expect(target.authenticate(request)).toBe(7);
  });
});
