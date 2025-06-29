import { Controller, Delete, Param, NotFoundException } from '@nestjs/common';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { DeleteCheckItemTransactionScript } from 'src/notes/domain/transaction-scripts/delete-check-item.transaction.script';

@Controller('notes')
export class DeleteCheckItemAction {
  constructor(private readonly deleteCheckItemTS: DeleteCheckItemTransactionScript) {}

  @Delete('check-items/:id')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Delete a check item by ID',
    additionalResponses: [
      { status: 204, description: 'Check item deleted successfully.' },
      { status: 404, description: 'Check item not found.' }
    ]
  })
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<void> {
    await this.deleteCheckItemTS.apply(Number(id), authUser);
  }
} 