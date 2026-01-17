import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { TimeTracksModule } from './time-tracks/time-tracks.module';
import { TagsModule } from './tags/tags.module';
import { CheckItemsModule } from './check-items/check-items.module';
import * as Joi from 'joi';
import { AudioModule } from './audio/audio.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { LoggingModule } from './shared-kernel/apps/logging/logging.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedKernelModule } from './shared-kernel/shared-kernel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      validationSchema: Joi.object({
        DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        COOKIE_KEY: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        HERMES_API_URL: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASS: Joi.string().required(),
        SMTP_FROM: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    TimeTracksModule,
    TagsModule,
    CheckItemsModule,
    AudioModule,
    CalendarEventsModule,
    EventEmitterModule.forRoot(),
    LoggingModule,
    SharedKernelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
