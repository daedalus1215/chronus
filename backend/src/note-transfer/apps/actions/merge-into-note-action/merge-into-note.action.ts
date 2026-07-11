import { Controller, Post, Body, Param } from '@nestjs/common';

import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteTransferService } from '../../../domain/services/note-transfer-service/note-transfer.service';
import { MergeIntoNoteSwagger } from './merge-into-note.swagger';
import { MergeIntoNoteDto } from '../../dtos/requests/merge-into-note.dto';

@Controller('notes')
export class MergeIntoNoteAction {
  constructor(private readonly noteTransferService: NoteTransferService) {}

  @Post(':id/merge')
  @ProtectedAction(MergeIntoNoteSwagger)
  async apply(
    @Param('id') id: string,
    @Body() dto: MergeIntoNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ success: boolean }> {
    const noteId = parseInt(id, 10);

    await this.noteTransferService.mergeIntoNote(noteId, dto, authUser.userId);

    return { success: true };
  }
}
