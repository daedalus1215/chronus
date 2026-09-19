import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { TimeTrackResponseDto } from '../../dtos/responses/time-track.response.dto';
import { UpdateTimeTrackDto } from './update-time-track.dto';
import { UpdateTimeTrackNoteSwagger } from './update-time-track-note.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class UpdateTimeTrackNoteAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Patch(':id')
  @ProtectedAction(UpdateTimeTrackNoteSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimeTrackDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<TimeTrackResponseDto> {
    const projection = await this.timeTrackService.updateTimeTrackNote(
      id,
      authUser.userId,
      dto
    );
    return new TimeTrackResponseDto(projection);
  }
}
