import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Admission control for live transcription sessions.
 *
 * Thoth is single-session per process: `app/di/container.py` builds one
 * InMemoryAudioBuffer and one streaming engine at boot and shares them across
 * every WebSocket connection, so two concurrent streams interleave audio from
 * different speakers into one Whisper window. The result is corrupt, not merely
 * degraded, and it fails silently.
 *
 * We do not build multi-session support. We fail loudly instead: this registry
 * caps live sessions per user, and thoth rejects a second concurrent connection
 * outright (thoth-backend/specs/stream-audio-hardening.md §4).
 *
 * In-memory and therefore per-process. Fine for the current single-instance
 * deployment; a scaled-out backend would need shared state.
 *
 * See specs/transcription-gateway.md §3 and §6.4.
 */
@Injectable()
export class TranscriptionSessionRegistry {
  private readonly sessionsByUser = new Map<number, number>();
  private readonly maxSessionsPerUser: number;

  constructor(private readonly configService: ConfigService) {
    this.maxSessionsPerUser = Number(
      this.configService.get<string>('TRANSCRIPTION_MAX_SESSIONS_PER_USER') ?? 1
    );
  }

  /**
   * @returns false when the user already holds the maximum number of sessions.
   * A successful claim MUST be matched by a `release` on every exit path — a
   * leaked claim locks the user out until the process restarts.
   */
  tryClaim(userId: number): boolean {
    const held = this.sessionsByUser.get(userId) ?? 0;
    if (held >= this.maxSessionsPerUser) {
      return false;
    }
    this.sessionsByUser.set(userId, held + 1);
    return true;
  }

  release(userId: number): void {
    const held = this.sessionsByUser.get(userId) ?? 0;
    if (held <= 1) {
      this.sessionsByUser.delete(userId);
      return;
    }
    this.sessionsByUser.set(userId, held - 1);
  }

  /** Test seam: asserts no claim leaked after a session ends. */
  activeSessionCount(): number {
    let total = 0;
    for (const held of this.sessionsByUser.values()) {
      total += held;
    }
    return total;
  }
}
