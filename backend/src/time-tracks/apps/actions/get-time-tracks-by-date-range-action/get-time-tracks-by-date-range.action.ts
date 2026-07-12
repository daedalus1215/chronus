import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { GetTimeTracksByDateRangeTransactionScript } from '../../../domain/transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.transaction.script';
import { GetTimeTracksByDateRangeDto } from './dtos/get-time-tracks-by-date-range.dto';
import { GetTimeTracksByDateRangeSwagger } from './get-time-tracks-by-date-range.swagger';
import { TimeTrackWithNoteResponse } from '../../dtos/responses/time-track-with-note.response.dto';
import { NoteAggregator } from 'src/notes/domain/aggregators/note.aggregator';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class GetTimeTracksByDateRangeAction {
  constructor(
    private readonly ts: GetTimeTracksByDateRangeTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  @Get('date-range')
  @ProtectedAction(GetTimeTracksByDateRangeSwagger)
  async apply(
    @Query() dto: GetTimeTracksByDateRangeDto,
    @GetAuthUser() user: AuthUser
  ): Promise<TimeTrackWithNoteResponse[]> {
    const tracks: TimeTrack[] = await this.ts.apply({
      from: dto.from,
      to: dto.to,
      userId: user.userId,
    });

    const noteIds = [...new Set(tracks.map(t => t.noteId))];
    const noteNames = await this.noteAggregator.getNoteNamesByIds(
      noteIds,
      user.userId
    );
    const noteNameMap = new Map(noteNames.map(n => [n.id, n.name]));

    return tracks.map(track => {
      const noteName = noteNameMap.get(track.noteId) ?? 'Deleted note';
      return new TimeTrackWithNoteResponse({
        ...track,
        noteName,
      });
    });
  }
}
