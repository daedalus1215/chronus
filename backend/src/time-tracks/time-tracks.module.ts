import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrack } from './domain/entities/time-track-entity/time-track.entity';
import { TimeTrackRepository } from './infra/repositories/time-track.repository';
import { CreateTimeTrackTransactionScript } from './domain/transaction-scripts/create-time-track.transaction.script';
import { GetNoteTimeTracksTransactionScript } from './domain/transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { CreateTimeTrackAction } from './apps/actions/create-time-track-action/create-time-track.action';
import { GetNoteTimeTracksAction } from './apps/actions/get-note-time-tracks-action/get-note-time-tracks.action';
import { NotesModule } from '../notes/notes.module';
import { TimeTrackService } from './domain/services/time-track.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTrack]),
    NotesModule,
  ],
  providers: [
    TimeTrackRepository,
    CreateTimeTrackTransactionScript,
    GetNoteTimeTracksTransactionScript,
    TimeTrackService,
  ],
  controllers: [
    CreateTimeTrackAction,
    GetNoteTimeTracksAction
  ],
  exports: [TimeTrackRepository]
})
export class TimeTracksModule {} 