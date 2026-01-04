import { Post, Body, Controller, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { CreateTimeTrackSwagger } from './create-time-track.swagger';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { CreateTimeTrackDto } from '../../dtos/requests/create-time-track.dto';

@Controller(`time-tracks`)
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class CreateTimeTrackAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Post()
  @ProtectedAction(CreateTimeTrackSwagger)
  async apply(@Body() dto: CreateTimeTrackDto, @GetAuthUser() user: AuthUser) {
    return this.timeTrackService.createTimeTrack({
      ...dto,
      user,
    });
  }
}
