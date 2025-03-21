import { Module } from '@nestjs/common';
import { DummyController } from './dummy-domain/app/dummy.controller';
import { DummyService } from './dummy-domain/domain/dummy.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DummyDomainModule } from './dummy-domain/dummy-domain.module';
import { NotesModule } from './notes/notes.module';
import { User } from './users/domain/entities/user.entity';
import { Note } from './notes/domain/entities/notes/note.entity';
import { Tag } from './notes/domain/entities/tag/tag.entity';
import { Memo } from './notes/domain/entities/notes/memo.entity';
import { TagNote } from './notes/domain/entities/tag/tag-note.entity';

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
        entities: [User, Note, Tag, Memo, TagNote],
        synchronize: false, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DummyDomainModule,
    NotesModule,
  ],
  controllers: [DummyController],
  providers: [DummyService],
})
export class AppModule { }
