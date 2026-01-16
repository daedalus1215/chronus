import { Controller, Get } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { StreakResponseDto } from '../../dtos/responses/streak.response.dto';
import { GetStreakSwagger } from './get-streak.swagger';

@Controller('time-tracks')
export class GetStreakAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/streak')
  @ProtectedAction(GetStreakSwagger)
  async apply(@GetAuthUser() user: AuthUser): Promise<StreakResponseDto> {
    return await this.timeTrackService.getStreak(user.userId);
  }
}
