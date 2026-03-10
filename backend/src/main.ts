import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { getHttpsOptions } from './bootstrap/configure-https';
import { configureBodyParser } from './bootstrap/configure-body-parser';
import { configureCors } from './bootstrap/configure-cors';
import { configureValidation } from './bootstrap/configure-validation';
import { configureSwagger } from './bootstrap/configure-swagger';
import { configureGracefulShutdown } from './bootstrap/configure-graceful-shutdown';

const bootstrap = async (): Promise<void> => {
  const httpsOptions = getHttpsOptions();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    ...(httpsOptions ? { httpsOptions } : {}),
    bodyParser: false,
  });

  const logger = app.get(Logger);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  configureBodyParser(app);
  configureCors(app);
  configureValidation(app);
  configureSwagger(app);
  configureGracefulShutdown(app, logger);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const protocol = httpsOptions ? 'HTTPS' : 'HTTP';
  logger.log(`${protocol} enabled on port ${port}`);
};

bootstrap();
