import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrack } from './domain/entities/time-track-entity/time-track.entity';
import { TimeTrackRepository } from './infra/repositories/time-track.repository';
import { CreateTimeTrackTransactionScript } from './domain/transaction-scripts/create-time-track-TS/create-time-track.transaction.script';
import { CreateTimeTrackAction } from './apps/actions/create-time-track-action/create-time-track.action';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTrack]),
    NotesModule
  ],
  providers: [
    TimeTrackRepository,
    CreateTimeTrackTransactionScript
  ],
  controllers: [CreateTimeTrackAction],
  exports: [TimeTrackRepository]
})
export class TimeTracksModule {} 