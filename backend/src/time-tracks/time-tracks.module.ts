import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrack } from './domain/entities/time-track-entity/time-track.entity';
import { TimeTrackRepository } from './infra/repositories/time-track.repository';
import { CreateTimeTrackTransactionScript } from './domain/transaction-scripts/create-time-track.transaction.script';
import { GetNoteTimeTracksTransactionScript } from './domain/transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { CreateTimeTrackAction } from './apps/actions/create-time-track-action/create-time-track.action';
import { GetTimeTracksByNoteIdAction } from './apps/actions/get-time-tracks-by-note-id-action/get-time-tracks-by-note-id.action';
import { GetTimeTracksTotalByNoteIdAction } from './apps/actions/get-time-tracks-total-by-note-id-action/get-time-tracks-total-by-note-id.action';
import { GetTimeTracksTotalByNoteIdTransactionScript } from './domain/transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { NotesModule } from '../notes/notes.module';
import { TimeTrackService } from './domain/services/time-track.service';
import { DeleteTimeTrackAction } from './apps/actions/delete-time-track-action/delete-time-track.action';
import { DeleteTimeTrackTransactionScript } from './domain/transaction-scripts/delete-time-track.transaction.script';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeTrack]),
    NotesModule,
  ],
  providers: [
    TimeTrackRepository,
    CreateTimeTrackTransactionScript,
    GetNoteTimeTracksTransactionScript,
    GetTimeTracksTotalByNoteIdTransactionScript,
    DeleteTimeTrackTransactionScript,
    TimeTrackService,
  ],
  controllers: [
    CreateTimeTrackAction,
    GetTimeTracksByNoteIdAction,
    GetTimeTracksTotalByNoteIdAction,
    DeleteTimeTrackAction
  ],
  exports: [TimeTrackRepository]
})
export class TimeTracksModule {} 