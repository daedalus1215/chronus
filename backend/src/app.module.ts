import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configurePgDateParser } from './bootstrap/configure-pg-date-parser';
import { NotesModule } from './notes/notes.module';
import { TimeTracksModule } from './time-tracks/time-tracks.module';
import { TagsModule } from './tags/tags.module';
import { CheckItemsModule } from './check-items/check-items.module';
import * as Joi from 'joi';
import { AudioModule } from './audio/audio.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggingModule } from './shared-kernel/apps/logging/logging.module';
import { SharedKernelModule } from './shared-kernel/shared-kernel.module';
import { SecurityEventsModule } from './security-events/security-events.module';
import { FoldersModule } from './folders/folders.module';
import { NoteTransferModule } from './note-transfer/note-transfer.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    SecurityEventsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        COOKIE_KEY: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        HERMES_API_URL: Joi.string().required(),
        ALLOW_REGISTRATION: Joi.string().valid('true', 'false').optional(),
        FRONTEND_ORIGIN: Joi.string().optional(),
        // Optional on purpose: deployment copies a fixed .env onto the host, so a
        // missing value must disable transcription rather than block startup.
        //
        // ⚠️ .allow('') matters as much as .optional(). Docker Compose cannot omit an
        // environment key conditionally — an unset variable is passed through as an
        // EMPTY STRING, not left out. Without this, a compose file that leaves
        // transcription off crash-loops the container on a validation error, which is
        // the exact opposite of the intent stated above. The consumer already treats
        // '' and undefined identically (`if (!url)`).
        THOTH_WS_URL: Joi.string().allow('').optional(),
        THOTH_CA_CERT: Joi.string().allow('').optional(),
        TRANSCRIPTION_MAX_SESSION_MS: Joi.number().optional(),
        TRANSCRIPTION_MAX_SESSIONS_PER_USER: Joi.number().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Bound to connection creation, not to app bootstrap, so no entry point
        // (worker, seed script, integration test) can open a connection without it.
        configurePgDateParser();

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/typeorm/migrations/*{.ts,.js}'],
          // NOT `runMigrations` — that key is silently ignored.
          migrationsRun: true,
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    TimeTracksModule,
    TagsModule,
    CheckItemsModule,
    AudioModule,
    NoteTransferModule,
    EventEmitterModule.forRoot(),
    LoggingModule,
    SharedKernelModule,
    FoldersModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
