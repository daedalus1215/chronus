import { Injectable } from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackTransactionScript } from '../../transaction-scripts/create-time-track.transaction.script';
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
import { GET_NOTE_DETAILS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/get-note-details.command';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WeeklyTrendResponseDto } from '../../../apps/dtos/responses/weekly-trend.response.dto';
import { StreakResponseDto } from '../../../apps/dtos/responses/streak.response.dto';
import { NotesByYearResponseDto } from '../../../apps/dtos/responses/notes-by-year.response.dto';
import { TagAggregator } from '../../../../tags/domain/aggregators/tag.aggregator';

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
    private readonly tagAggregator: TagAggregator,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createTimeTrack(command: CreateTimeTrackCommand) {
    await this.validateTimeTrackCreation(command);
    return this.createTimeTrackTS.apply(command);
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

  async getWeeklyMostActiveNote(userId: number) {
    const result = await this.getWeeklyMostActiveNoteTS.apply(userId);
    const note = await this.eventEmitter.emitAsync(GET_NOTE_DETAILS_COMMAND, {
      noteId: result.noteId,
      userId,
    });

    return { ...result, noteName: note[0].name };
  }

  async getWeeklyTrend(userId: number): Promise<WeeklyTrendResponseDto> {
    const trend = await this.getWeeklyTrendTS.apply(userId, 7);
    const weeklyTotal = trend.reduce((sum, day) => sum + day.totalMinutes, 0);
    return { trend, weeklyTotal };
  }

  async getStreak(userId: number): Promise<StreakResponseDto> {
    return this.getStreakTS.apply(userId);
  }

  async getNotesByYear(
    command: GetNotesByYearCommand
  ): Promise<NotesByYearResponseDto> {
    const notesByYear = await this.getNotesByYearTS.apply(command);
    const noteIds = notesByYear.map(n => n.noteId);
    const uniqueNoteIds = [...new Set(noteIds)];
    const noteNames = await this.noteAggregator.getNoteNamesByIds(
      uniqueNoteIds,
      command.user.userId
    );
    const noteNamesMap = new Map(
      noteNames.map(n => [n.id, n.name])
    );
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
}
