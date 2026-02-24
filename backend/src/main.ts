import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ServerOptions } from 'https';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  // Configure HTTPS if certificates are provided
  const httpsOptions = getHttpsOptions();

  // Create the app with HTTPS if configured
  const app = httpsOptions
    ? await NestFactory.create(AppModule, { httpsOptions })
    : await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const corsOrigin = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map(s => s.trim())
    : true;
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    })
  );

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV');
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const logger = app.get(Logger);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  if (httpsOptions) {
    logger.log(`🔒 HTTPS enabled on port ${port}`);
  } else {
    logger.log(`🌐 HTTP enabled on port ${port}`);
  }
}

function getHttpsOptions(): ServerOptions | undefined {
  // Check environment variables first
  const sslKeyPath = process.env.SSL_KEYFILE;
  const sslCertPath = process.env.SSL_CERTFILE;

  // If both paths are provided via environment variables, use them
  if (sslKeyPath && sslCertPath) {
    try {
      if (!existsSync(sslKeyPath) || !existsSync(sslCertPath)) {
        // Note: Logger not available here, using console
        console.warn(`⚠️  SSL certificate files not found at specified paths`);
        return undefined;
      }
      return {
        key: readFileSync(sslKeyPath),
        cert: readFileSync(sslCertPath),
      };
    } catch (error) {
      // Note: Logger not available here, using console
      console.warn(
        `⚠️  Failed to load SSL certificates: ${error instanceof Error ? error.message : String(error)}`
      );
      console.warn('⚠️  Falling back to HTTP');
      return undefined;
    }
  }

  // Try default shared-certs location if no paths provided
  // From backend/dist/main.js: go up 3 levels to programming/, then into shared-certs/
  const programmingDir = join(__dirname, '../../..');
  const defaultSharedCertsPath = join(programmingDir, 'shared-certs');
  const defaultKeyPath = join(defaultSharedCertsPath, 'server.key');
  const defaultCertPath = join(defaultSharedCertsPath, 'server.crt');

  if (existsSync(defaultKeyPath) && existsSync(defaultCertPath)) {
    try {
      const key = readFileSync(defaultKeyPath);
      const cert = readFileSync(defaultCertPath);
      // Note: Logger not available here, using console
      console.log(`🔒 Using SSL certificates from: ${defaultSharedCertsPath}`);
      return { key, cert };
    } catch (error) {
      // Note: Logger not available here, using console
      console.warn(
        `⚠️  Failed to read SSL certificates: ${error instanceof Error ? error.message : String(error)}`
      );
      return undefined;
    }
  }

  // Certificates not found, continue with HTTP
  return undefined;
}

bootstrap();
