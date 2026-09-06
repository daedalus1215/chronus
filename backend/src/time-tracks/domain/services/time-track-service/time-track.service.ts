import { Injectable } from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackTransactionScript } from '../../transaction-scripts/create-time-track-TS/create-time-track.transaction.script';
import { CreateTimeTrackCommand } from '../../transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetNoteTimeTracksTransactionScript } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { GetNoteTimeTracksCommand } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.command';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { GetTimeTracksTotalByNoteIdTransactionScript } from '../../transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { GetDailyTimeTracksAggregationTransactionScript } from '../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.transaction.script';
import { GetDailyTimeTracksAggregationCommand } from '../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.command';
import { GetWeeklyMostActiveNoteTransactionScript } from '../../transaction-scripts/get-weekly-most-active-note-TS/get-weekly-most-active-note.transaction.script';
import { GetWeeklyTrendTransactionScript } from '../../transaction-scripts/get-weekly-trend-TS/get-weekly-trend.transaction.script';
import { GetStreakTransactionScript } from '../../transaction-scripts/get-streak-TS/get-streak.transaction.script';
import { GetNotesByYearTransactionScript } from '../../transaction-scripts/get-notes-by-year-TS/get-notes-by-year.transaction.script';
import { GetNotesByYearCommand } from '../../transaction-scripts/get-notes-by-year-TS/get-notes-by-year.command';
import { GetTimeTracksByDateRangeTransactionScript } from '../../transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.transaction.script';
import { GetTimeTracksByDateRangeCommand } from '../../transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.command';
import { GET_NOTE_DETAILS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/get-note-details.command';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TagAggregator } from '../../../../tags/domain/aggregators/tag.aggregator';
import { UpdateTimeTrackNoteTransactionScript } from '../../transaction-scripts/update-time-track-note-TS/update-time-track-note.transaction.script';
import {
  WeeklyTrendProjection,
  StreakProjection,
  NotesByYearProjection,
  TimeTrackWithNoteProjection,
  TimeTrackProjection,
  WeeklyMostActiveNoteProjection,
} from '../../projections/time-track.projections';

// Aliases kept for backward compat with TS script signatures
export type UpdateTimeTrackPayload = {
  startTime?: string;
  durationMinutes?: number;
  note?: string;
};

//@TODO: Move this to a command object
type ValidateTimeTrackCreationCommand = {
  noteId: number;
  user: AuthUser;
};

@Injectable()
export class TimeTrackService {
  constructor(
    private readonly createTimeTrackTS: CreateTimeTrackTransactionScript,
    private readonly getNoteTimeTracksTotalByNoteId: GetNoteTimeTracksTransactionScript,
    private readonly noteAggregator: NoteAggregator,
    private readonly getTimeTracksTotalByNoteIdTS: GetTimeTracksTotalByNoteIdTransactionScript,
    private readonly getDailyTimeTracksAggregationTS: GetDailyTimeTracksAggregationTransactionScript,
    private readonly getWeeklyMostActiveNoteTS: GetWeeklyMostActiveNoteTransactionScript,
    private readonly getWeeklyTrendTS: GetWeeklyTrendTransactionScript,
    private readonly getStreakTS: GetStreakTransactionScript,
    private readonly getNotesByYearTS: GetNotesByYearTransactionScript,
    private readonly getTimeTracksByDateRangeTS: GetTimeTracksByDateRangeTransactionScript,
    private readonly tagAggregator: TagAggregator,
    private readonly eventEmitter: EventEmitter2,
    private readonly updateTimeTrackNoteTS: UpdateTimeTrackNoteTransactionScript
  ) {}

  async createTimeTrack(
    command: CreateTimeTrackCommand
  ): Promise<TimeTrackProjection> {
    await this.validateTimeTrackCreation(command);
    const entity = await this.createTimeTrackTS.apply(command);
    return this.toTimeTrackProjection(entity);
  }

  private async validateTimeTrackCreation(
    command: ValidateTimeTrackCreationCommand
  ) {
    await this.noteAggregator.belongsToUser({
      noteId: command.noteId,
      user: {
        id: command.user.userId,
      },
    });
  }

  async getNoteTimeTracks(command: GetNoteTimeTracksCommand) {
    await this.validateTimeTrackCreation(command);
    return this.getNoteTimeTracksTotalByNoteId.apply(command);
  }

  async getNoteTimeTracksTotal(command: GetNoteTimeTracksCommand) {
    await this.validateTimeTrackCreation(command);
    return this.getTimeTracksTotalByNoteIdTS.apply(command);
  }

  async getDailyTimeTracksAggregation(
    command: GetDailyTimeTracksAggregationCommand
  ) {
    const trackTimeTracks =
      await this.getDailyTimeTracksAggregationTS.apply(command);
    const noteNames = await this.noteAggregator.getNoteNamesByIds(
      trackTimeTracks.map(track => track.noteId),
      command.user.userId
    );
    return { trackTimeTracks, noteNames };
  }

  async getWeeklyMostActiveNote(
    userId: number,
    date?: string
  ): Promise<WeeklyMostActiveNoteProjection> {
    const result = await this.getWeeklyMostActiveNoteTS.apply(userId, date);
    if (!result) {
      return null;
    }
    const note = await this.eventEmitter.emitAsync(GET_NOTE_DETAILS_COMMAND, {
      noteId: result.noteId,
      userId,
    });

    return {
      noteId: result.noteId,
      totalTimeMinutes: result.totalTimeMinutes,
      weekStartDate: result.weekStartDate,
      weekEndDate: result.weekEndDate,
      noteName: note?.[0]?.name ?? 'Unknown',
    };
  }

  async getWeeklyTrend(
    userId: number,
    date?: string
  ): Promise<WeeklyTrendProjection> {
    const trend = await this.getWeeklyTrendTS.apply(userId, 7, date);
    const weeklyTotal = trend.reduce((sum, day) => sum + day.totalMinutes, 0);
    return { trend, weeklyTotal };
  }

  async getStreak(userId: number, date?: string): Promise<StreakProjection> {
    return this.getStreakTS.apply(userId, date);
  }

  async getNotesByYear(
    command: GetNotesByYearCommand
  ): Promise<NotesByYearProjection> {
    const notesByYear = await this.getNotesByYearTS.apply(command);
    const noteIds = notesByYear.map(n => n.noteId);
    const uniqueNoteIds = [...new Set(noteIds)];
    const noteNames = await this.noteAggregator.getNoteNamesByIds(
      uniqueNoteIds,
      command.user.userId
    );
    const noteNamesMap = new Map(noteNames.map(n => [n.id, n.name]));
    const tagsMap = await this.tagAggregator.getTagsByNoteIds(uniqueNoteIds);
    const notesWithNames = notesByYear.map(note => ({
      ...note,
      noteName: noteNamesMap.get(note.noteId) || 'Unknown',
      tags: tagsMap.get(note.noteId) || [],
    }));
    const yearsMap = new Map<number, typeof notesWithNames>();
    for (const note of notesWithNames) {
      if (!yearsMap.has(note.year)) {
        yearsMap.set(note.year, []);
      }
      yearsMap.get(note.year)!.push(note);
    }
    const years = Array.from(yearsMap.entries())
      .map(([year, notes]) => ({
        year,
        notes: notes.map(n => ({
          noteId: n.noteId,
          noteName: n.noteName,
          firstDate: n.firstDate,
          lastDate: n.lastDate,
          totalTimeMinutes: n.totalTimeMinutes,
          dateCount: n.dateCount,
          tags: n.tags,
        })),
      }))
      .sort((a, b) => b.year - a.year);
    return { years };
  }

  async getTimeTracksByDateRange(
    command: GetTimeTracksByDateRangeCommand
  ): Promise<TimeTrackWithNoteProjection[]> {
    const tracks = await this.getTimeTracksByDateRangeTS.apply(command);
    const noteIds = [...new Set(tracks.map(t => t.noteId))];
    const noteNames = await this.noteAggregator.getNoteNamesByIds(
      noteIds,
      command.userId
    );
    const noteNameMap = new Map(noteNames.map(n => [n.id, n.name]));

    return tracks.map(track => {
      const noteName = noteNameMap.get(track.noteId) ?? 'Deleted note';
      return {
        id: track.id,
        noteId: track.noteId,
        noteName,
        date: track.date,
        startTime: track.startTime,
        durationMinutes: track.durationMinutes,
        note: track.note,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
      };
    });
  }

  async updateTimeTrackNote(
    id: number,
    userId: number,
    payload: UpdateTimeTrackPayload
  ): Promise<TimeTrackProjection> {
    const entity = await this.updateTimeTrackNoteTS.apply(id, userId, payload);
    return this.toTimeTrackProjection(entity);
  }

  private toTimeTrackProjection(entity: {
    id: number;
    userId: number;
    noteId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
  }): TimeTrackProjection {
    return {
      id: entity.id,
      userId: entity.userId,
      noteId: entity.noteId,
      date: entity.date,
      startTime: entity.startTime,
      durationMinutes: entity.durationMinutes,
      note: entity.note,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
