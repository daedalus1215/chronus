import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrack } from './domain/entities/time-track-entity/time-track.entity';
import { TimeTrackRepository } from './infra/repositories/time-track.repository';
import { CreateTimeTrackTransactionScript } from './domain/transaction-scripts/create-time-track-TS/create-time-track.transaction.script';
import { GetNoteTimeTracksTransactionScript } from './domain/transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { CreateTimeTrackAction } from './apps/actions/create-time-track-action/create-time-track.action';
import { FetchTimeTracksByNoteIdAction } from './apps/actions/fetch-time-tracks-by-note-id-action/fetch-time-tracks-by-note-id.action';
import { FetchTimeTracksTotalByNoteIdAction } from './apps/actions/fetch-time-tracks-total-by-note-id-action/fetch-time-tracks-total-by-note-id.action';
import { GetTimeTracksTotalByNoteIdTransactionScript } from './domain/transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { GetDailyTimeTracksAggregationTransactionScript } from './domain/transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.transaction.script';
import { NotesModule } from '../notes/notes.module';
import { TagsModule } from '../tags/tags.module';
import { TimeTrackService } from './domain/services/time-track-service/time-track.service';
import { TimeTrackWithNoteNamesResponder } from './apps/actions/fetch-daily-time-tracks-aggregation-action/time-track-with-note-names.responder';
import { DeleteTimeTrackAction } from './apps/actions/delete-time-track-action/delete-time-track.action';
import { DeleteTimeTrackTransactionScript } from './domain/transaction-scripts/delete-time-track-TS/delete-time-track.transaction.script';
import { UpdateTimeTrackNoteAction } from './apps/actions/update-time-track-note-action/update-time-track-note.action';
import { UpdateTimeTrackNoteTransactionScript } from './domain/transaction-scripts/update-time-track-note-TS/update-time-track-note.transaction.script';
import { UpdateTimeTrackPayloadConverter } from './domain/transaction-scripts/update-time-track-note-TS/update-time-track-note.converter';
import { FetchDailyTimeTracksAction } from './apps/actions/fetch-daily-time-tracks-aggregation-action/fetch-daily-time-tracks-aggregation.action';
import { FetchWeeklyMostActiveNoteAction } from './apps/actions/fetch-weekly-most-active-note-action/fetch-weekly-most-active-note.action';
import { GetWeeklyMostActiveNoteTransactionScript } from './domain/transaction-scripts/get-weekly-most-active-note-TS/get-weekly-most-active-note.transaction.script';
import { FetchWeeklyTrendAction } from './apps/actions/fetch-weekly-trend-action/fetch-weekly-trend.action';
import { GetWeeklyTrendTransactionScript } from './domain/transaction-scripts/get-weekly-trend-TS/get-weekly-trend.transaction.script';
import { GetStreakTransactionScript } from './domain/transaction-scripts/get-streak-TS/get-streak.transaction.script';
import { FetchStreakAction } from './apps/actions/fetch-streak-action/fetch-streak.action';
import { FetchNotesByYearAction } from './apps/actions/fetch-notes-by-year-action/fetch-notes-by-year.action';
import { GetNotesByYearTransactionScript } from './domain/transaction-scripts/get-notes-by-year-TS/get-notes-by-year.transaction.script';
import { FetchTimeTracksByDateRangeAction } from './apps/actions/fetch-time-tracks-by-date-range-action/fetch-time-tracks-by-date-range.action';
import { GetTimeTracksByDateRangeTransactionScript } from './domain/transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.transaction.script';
import { TimeTracksAggregator } from './domain/aggregators/time-tracks.aggregator';
import { TIME_TRACK_WRITER_PORT } from '../note-transfer/domain/ports/time-track-writer.port';

@Module({
  imports: [TypeOrmModule.forFeature([TimeTrack]), NotesModule, TagsModule],
  providers: [
    TimeTrackRepository,
    CreateTimeTrackTransactionScript,
    GetNoteTimeTracksTransactionScript,
    GetTimeTracksTotalByNoteIdTransactionScript,
    GetDailyTimeTracksAggregationTransactionScript,
    DeleteTimeTrackTransactionScript,
    UpdateTimeTrackNoteTransactionScript,
    UpdateTimeTrackPayloadConverter,
    TimeTrackService,
    TimeTrackWithNoteNamesResponder,
    GetWeeklyMostActiveNoteTransactionScript,
    GetWeeklyTrendTransactionScript,
    GetStreakTransactionScript,
    GetNotesByYearTransactionScript,
    GetTimeTracksByDateRangeTransactionScript,
    TimeTracksAggregator,
    {
      provide: TIME_TRACK_WRITER_PORT,
      useExisting: TimeTracksAggregator,
    },
  ],
  controllers: [
    CreateTimeTrackAction,
    FetchTimeTracksByNoteIdAction,
    FetchTimeTracksTotalByNoteIdAction,
    FetchDailyTimeTracksAction,
    DeleteTimeTrackAction,
    UpdateTimeTrackNoteAction,
    FetchWeeklyMostActiveNoteAction,
    FetchWeeklyTrendAction,
    FetchStreakAction,
    FetchNotesByYearAction,
    FetchTimeTracksByDateRangeAction,
  ],
  exports: [TimeTracksAggregator, TIME_TRACK_WRITER_PORT],
})
export class TimeTracksModule {}
