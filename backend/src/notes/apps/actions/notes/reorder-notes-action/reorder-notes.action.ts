import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ReorderNotesTransactionScript } from 'src/notes/domain/transaction-scripts/reorder-notes.transaction-script';
import { ReorderNotesDto } from './reorder-notes.dto';

@Controller('notes')
export class ReorderNotesAction {
  constructor(private readonly reorderNotesTS: ReorderNotesTransactionScript) {}

  @Patch('reorder')
  @HttpCode(204)
  @ProtectedAction({ tag: 'Notes', summary: 'Reorder notes within the same folder' })
  async apply(
    @Body() dto: ReorderNotesDto,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    const folderId = dto.folderId === undefined ? null : (dto.folderId ?? null);
    await this.reorderNotesTS.apply({ userId, items: dto.items, folderId });
  }
}
