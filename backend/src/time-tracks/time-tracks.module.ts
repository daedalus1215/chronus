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
import { GetDailyTimeTracksAggregationTransactionScript } from './domain/transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.transaction.script';
import { NotesModule } from '../notes/notes.module';
import { TagsModule } from '../tags/tags.module';
import { TimeTrackService } from './domain/services/time-track-service/time-track.service';
import { TimeTrackWithNoteNamesResponder } from './apps/actions/get-daily-time-tracks-aggregation-action/time-track-with-note-names.responder';
import { DeleteTimeTrackAction } from './apps/actions/delete-time-track-action/delete-time-track.action';
import { DeleteTimeTrackTransactionScript } from './domain/transaction-scripts/delete-time-track.transaction.script';
import { GetDailyTimeTracksAction } from './apps/actions/get-daily-time-tracks-aggregation-action/get-daily-time-tracks-aggregation.action';
import { GetWeeklyMostActiveNoteAction } from './apps/actions/get-weekly-most-active-note-action/get-weekly-most-active-note.action';
import { GetWeeklyMostActiveNoteTransactionScript } from './domain/transaction-scripts/get-weekly-most-active-note-TS/get-weekly-most-active-note.transaction.script';
import { GetWeeklyTrendAction } from './apps/actions/get-weekly-trend-action/get-weekly-trend.action';
import { GetWeeklyTrendTransactionScript } from './domain/transaction-scripts/get-weekly-trend-TS/get-weekly-trend.transaction.script';
import { GetStreakAction } from './apps/actions/get-streak-action/get-streak.action';
import { GetStreakTransactionScript } from './domain/transaction-scripts/get-streak-TS/get-streak.transaction.script';
import { GetNotesByYearAction } from './apps/actions/get-notes-by-year-action/get-notes-by-year.action';
import { GetNotesByYearTransactionScript } from './domain/transaction-scripts/get-notes-by-year-TS/get-notes-by-year.transaction.script';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTrack]), NotesModule, TagsModule],
  providers: [
    TimeTrackRepository,
    CreateTimeTrackTransactionScript,
    GetNoteTimeTracksTransactionScript,
    GetTimeTracksTotalByNoteIdTransactionScript,
    GetDailyTimeTracksAggregationTransactionScript,
    DeleteTimeTrackTransactionScript,
    TimeTrackService,
    TimeTrackWithNoteNamesResponder,
    GetWeeklyMostActiveNoteTransactionScript,
    GetWeeklyTrendTransactionScript,
    GetStreakTransactionScript,
    GetNotesByYearTransactionScript,
  ],
  controllers: [
    CreateTimeTrackAction,
    GetTimeTracksByNoteIdAction,
    GetTimeTracksTotalByNoteIdAction,
    GetDailyTimeTracksAction,
    DeleteTimeTrackAction,
    GetWeeklyMostActiveNoteAction,
    GetWeeklyTrendAction,
    GetStreakAction,
    GetNotesByYearAction,
  ],
  exports: [TimeTrackRepository],
})
export class TimeTracksModule {}
