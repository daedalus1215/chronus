import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { GetTimeTracksByDateRangeDto } from './dtos/get-time-tracks-by-date-range.dto';
import { FetchTimeTracksByDateRangeSwagger } from './fetch-time-tracks-by-date-range.swagger';
import { TimeTrackWithNoteResponse } from '../../dtos/responses/time-track-with-note.response.dto';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchTimeTracksByDateRangeAction {
  constructor(private readonly service: TimeTrackService) {}

  @Get('date-range')
  @ProtectedAction(FetchTimeTracksByDateRangeSwagger)
  async apply(
    @Query() dto: GetTimeTracksByDateRangeDto,
    @GetAuthUser() user: AuthUser
  ): Promise<TimeTrackWithNoteResponse[]> {
    return this.service.getTimeTracksByDateRange({
      from: dto.from,
      to: dto.to,
      userId: user.userId,
    });
  }
}
