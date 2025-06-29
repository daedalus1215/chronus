import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { User } from './users/domain/entities/user.entity';
import { Note } from './notes/domain/entities/notes/note.entity';
import { Tag } from './notes/domain/entities/tag/tag.entity';
import { Memo } from './notes/domain/entities/notes/memo.entity';
import { TagNote } from './notes/domain/entities/tag/tag-note.entity';
import { TimeTracksModule } from './time-tracks/time-tracks.module';
import { TimeTrack } from './time-tracks/domain/entities/time-track-entity/time-track.entity';
import { CheckItem } from './notes/domain/entities/notes/check-item.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE'),
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    NotesModule,
    TimeTracksModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
