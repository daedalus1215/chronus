import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { DeleteTagTransactionScript } from '../../../domain/transaction-scripts/delete-tag.transaction.script';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { DeleteTagSwagger } from './delete-tag.swagger';

@Controller('tags')
export class DeleteTagAction {
  constructor(private readonly deleteTagTS: DeleteTagTransactionScript) {}

  @Delete(':id')
  @ProtectedAction(DeleteTagSwagger)
  async deleteTag(
    @Param('id', ParseIntPipe) tagId: number,
    @GetAuthUser('userId') userId: number
  ): Promise<{ success: boolean }> {
    await this.deleteTagTS.apply(tagId, userId);
    return { success: true };
  }
}



