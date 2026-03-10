import type { NestExpressApplication } from '@nestjs/platform-express';

type CorsConfig = {
  readonly methods: string;
  readonly credentials: boolean;
};

const DEFAULT_CONFIG: CorsConfig = {
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
} as const;

/**
 * Configures CORS using FRONTEND_ORIGIN env var (comma-separated) or allows all origins.
 */
export const configureCors = (
  app: NestExpressApplication,
  config: Partial<CorsConfig> = {},
): void => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const corsOrigin = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((s) => s.trim())
    : true;

  app.enableCors({
    origin: corsOrigin,
    methods: mergedConfig.methods,
    credentials: mergedConfig.credentials,
  });
};
