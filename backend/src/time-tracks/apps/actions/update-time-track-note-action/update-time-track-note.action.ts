import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { UpdateTimeTrackNoteTransactionScript } from 'src/time-tracks/domain/transaction-scripts/update-time-track-note.transaction.script';
import { TimeTrackResponseDto } from '../../dtos/responses/time-track.response.dto';
import { UpdateTimeTrackNoteDto } from './dtos/update-time-track-note.dto';
import { UpdateTimeTrackNoteSwagger } from './update-time-track-note.swagger';

@Controller('time-tracks')
export class UpdateTimeTrackNoteAction {
  constructor(
    private readonly updateNoteTS: UpdateTimeTrackNoteTransactionScript
  ) {}

  @Patch(':id')
  @ProtectedAction(UpdateTimeTrackNoteSwagger)
  async execute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimeTrackNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<TimeTrackResponseDto> {
    return this.updateNoteTS.apply(id, authUser.userId, dto.note ?? null);
  }
}
