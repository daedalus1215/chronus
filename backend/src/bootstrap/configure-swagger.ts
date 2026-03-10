import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configures Swagger/OpenAPI documentation. Skipped in production.
 */
export const configureSwagger = (app: NestExpressApplication): void => {
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};
