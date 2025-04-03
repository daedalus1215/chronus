import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { RateLimit } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

export type NoteTimeTrackActionOptions = {
  path?: string;
  rateLimit?: {
    ttl: number;
    limit: number;
  };
  swagger?: {
    tag?: string;
    description?: string;
  };
}

export const NoteTimeTrackAction = (options: NoteTimeTrackActionOptions = {}) => {
  const {
    path = '',
    rateLimit = { ttl: 60000, limit: 10 },
    swagger = { tag: 'Time Tracking' }
  } = options;

  return applyDecorators(
    Controller(`notes/${path}`),
    ApiTags(swagger.tag),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    RateLimit({
      ttl: rateLimit.ttl,
      limit: rateLimit.limit
    })
  );
}; 