import { Injectable  } from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { CreateTimeTrackTransactionScript } from '../../transaction-scripts/create-time-track.transaction.script';
import { CreateTimeTrackCommand } from '../../transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetNoteTimeTracksTransactionScript } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { GetNoteTimeTracksCommand } from '../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.command';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { GetTimeTracksTotalByNoteIdTransactionScript } from '../../transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { GetTimeTracksAggregationTransactionScript } from '../../transaction-scripts/get-time-tracks-aggregation-TS/get-time-tracks-aggregation.transaction.script';
import { GetTimeTracksAggregationCommand } from '../../transaction-scripts/get-time-tracks-aggregation-TS/get-time-tracks-aggregation.command';
import { TimeTrackWithNoteNamesConverter } from './converter/time-track-with-note-names.converter';

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
    private readonly getTimeTracksAggregationTS: GetTimeTracksAggregationTransactionScript,
    private readonly timeTrackWithNoteNamesConverter: TimeTrackWithNoteNamesConverter
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

  async getTimeTracksAggregation(command: GetTimeTracksAggregationCommand) {
    const trackTimeTracks = await this.getTimeTracksAggregationTS.apply(command);
    const noteNames = await this.noteAggregator.getNoteNamesByIds(trackTimeTracks.map(track => track.noteId), command.user.userId);
    
    return this.timeTrackWithNoteNamesConverter.apply(trackTimeTracks, noteNames);
  }
} 