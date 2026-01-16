import { Controller, Get } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { WeeklyTrendResponseDto } from '../../dtos/responses/weekly-trend.response.dto';
import { GetWeeklyTrendSwagger } from './get-weekly-trend.swagger';

@Controller('time-tracks')
export class GetWeeklyTrendAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/weekly-trend')
  @ProtectedAction(GetWeeklyTrendSwagger)
  async apply(@GetAuthUser() user: AuthUser): Promise<WeeklyTrendResponseDto> {
    return await this.timeTrackService.getWeeklyTrend(user.userId);
  }
}
