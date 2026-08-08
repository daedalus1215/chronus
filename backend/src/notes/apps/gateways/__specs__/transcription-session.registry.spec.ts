import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createMock } from 'src/shared-kernel/test-utils';
import { TranscriptionSessionRegistry } from '../transcription-session.registry';

describe('TranscriptionSessionRegistry', () => {
  let target: TranscriptionSessionRegistry;

  const buildTarget = async (maxPerUser?: string) => {
    const configServiceMock = createMock<ConfigService>({
      get: jest.fn().mockReturnValue(maxPerUser),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TranscriptionSessionRegistry,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    return moduleRef.get(TranscriptionSessionRegistry);
  };

  beforeEach(async () => {
    target = await buildTarget();
  });

  it('grants a first claim', () => {
    expect(target.tryClaim(1)).toBe(true);
  });

  it('rejects a second concurrent claim for the same user', () => {
    target.tryClaim(1);

    expect(target.tryClaim(1)).toBe(false);
  });

  it('allows a different user to claim concurrently', () => {
    target.tryClaim(1);

    expect(target.tryClaim(2)).toBe(true);
  });

  it('allows reclaiming after release', () => {
    target.tryClaim(1);
    target.release(1);

    expect(target.tryClaim(1)).toBe(true);
  });

  it('leaves no active sessions once released', () => {
    target.tryClaim(1);
    target.tryClaim(2);
    target.release(1);
    target.release(2);

    expect(target.activeSessionCount()).toBe(0);
  });

  it('tolerates releasing a claim that was never taken', () => {
    expect(() => target.release(99)).not.toThrow();
    expect(target.activeSessionCount()).toBe(0);
  });

  it('honours a raised per-user cap', async () => {
    target = await buildTarget('2');

    expect(target.tryClaim(1)).toBe(true);
    expect(target.tryClaim(1)).toBe(true);
    expect(target.tryClaim(1)).toBe(false);
  });
});
