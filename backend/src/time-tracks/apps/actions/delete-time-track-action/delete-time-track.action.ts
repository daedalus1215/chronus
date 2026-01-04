import { Controller, Delete, Param } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { DeleteTimeTrackTransactionScript } from 'src/time-tracks/domain/transaction-scripts/delete-time-track.transaction.script';
import { DeleteTimeTrackSwagger } from './delete-time-track.swagger';

@Controller('time-tracks')
export class DeleteTimeTrackAction {
  constructor(private readonly deleteTS: DeleteTimeTrackTransactionScript) {}

  @Delete(':id')
  @ProtectedAction(DeleteTimeTrackSwagger)
  async execute(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ success: boolean }> {
    await this.deleteTS.apply(Number(id), authUser.userId);
    return { success: true };
  }
}
