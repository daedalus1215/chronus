import { Injectable  } from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackTransactionScript } from '../../transaction-scripts/create-time-track.transaction.script';
import { CreateTimeTrackCommand } from '../../transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetNoteTimeTracksTransactionScript } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { GetNoteTimeTracksCommand } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.command';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { GetTimeTracksTotalByNoteIdTransactionScript } from '../../transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { GetDailyTimeTracksAggregationTransactionScript } from '../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.transaction.script';
import { GetDailyTimeTracksAggregationCommand } from '../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.command';
import { TimeTrackWithNoteNamesConverter } from './converter/time-track-with-note-names.converter';
import { GetWeeklyMostActiveNoteTransactionScript } from '../../transaction-scripts/get-weekly-most-active-note-TS/get-weekly-most-active-note.transaction.script';
import { WeeklyMostActiveNoteResponseDto } from '../../../apps/dtos/responses/weekly-most-active-note.response.dto';
import { GET_NOTE_DETAILS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/get-note-details.command';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    private readonly timeTrackWithNoteNamesConverter: TimeTrackWithNoteNamesConverter,
    private readonly getWeeklyMostActiveNoteTS: GetWeeklyMostActiveNoteTransactionScript,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTimeTrack(command: CreateTimeTrackCommand) {
    await this.validateTimeTrackCreation(command);
    return this.createTimeTrackTS.apply(command);
  }

  private async validateTimeTrackCreation(command: ValidateTimeTrackCreationCommand) {
    await this.noteAggregator.belongsToUser({
      noteId: command.noteId,
      user: {
        id: command.user.userId
      }
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

  async getDailyTimeTracksAggregation(command: GetDailyTimeTracksAggregationCommand) {
    const trackTimeTracks = await this.getDailyTimeTracksAggregationTS.apply(command);
    const noteNames = await this.noteAggregator.getNoteNamesByIds(trackTimeTracks.map(track => track.noteId), command.user.userId);
    return this.timeTrackWithNoteNamesConverter.apply(trackTimeTracks, noteNames);
  }

  async getWeeklyMostActiveNote(userId: number) {
    const result = await this.getWeeklyMostActiveNoteTS.apply(userId);
    console.log('result', result);
        const note = await this.eventEmitter.emitAsync(GET_NOTE_DETAILS_COMMAND, {
          noteId: result.noteId,
          userId,
        });

        console.log('note', note);
    return {...result, noteName: note[0].name};
  }
} 