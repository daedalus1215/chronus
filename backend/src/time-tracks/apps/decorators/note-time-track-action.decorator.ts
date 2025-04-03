import { applyDecorators, Controller } from '@nestjs/common';
import { RateLimiter } from '@nestjs/throttler';

export const NoteTimeTrackAction = (path: string = '') => {
  return applyDecorators(
    Controller(`notes/${path}`),
    RateLimit({
      ttl: 60000, // 1 minute window
      limit: 10   // 10 requests per minute
    })
  );
}; 