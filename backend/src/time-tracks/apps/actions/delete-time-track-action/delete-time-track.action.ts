import { Controller, Delete, Param } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { TimeTrackService } from 'src/time-tracks/domain/services/time-track-service/time-track.service';
import { DeleteTimeTrackSwagger } from './delete-time-track.swagger';

@Controller('time-tracks')
export class DeleteTimeTrackAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Delete(':id')
  @ProtectedAction(DeleteTimeTrackSwagger)
  async execute(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ success: boolean }> {
    await this.timeTrackService.deleteTimeTrack(Number(id), authUser.userId);
    return { success: true };
  }
}
