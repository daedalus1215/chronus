import type { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

type BodyParserConfig = {
  readonly jsonLimit: string;
  readonly urlencodedLimit: string;
  readonly extended: boolean;
};

const DEFAULT_CONFIG: BodyParserConfig = {
  jsonLimit: '1mb',
  urlencodedLimit: '1mb',
  extended: true,
} as const;

/**
 * Configures express body parser middleware with configurable size limits.
 * Uses BODY_LIMIT env var if set, otherwise falls back to defaults.
 */
export const configureBodyParser = (
  app: NestExpressApplication,
  config: Partial<BodyParserConfig> = {},
): void => {
  const envLimit = process.env.BODY_LIMIT;
  const mergedConfig: BodyParserConfig = {
    ...DEFAULT_CONFIG,
    ...(envLimit ? { jsonLimit: envLimit, urlencodedLimit: envLimit } : {}),
    ...config,
  };

  app.use(express.json({ limit: mergedConfig.jsonLimit }));
  app.use(
    express.urlencoded({
      limit: mergedConfig.urlencodedLimit,
      extended: mergedConfig.extended,
    }),
  );
};
