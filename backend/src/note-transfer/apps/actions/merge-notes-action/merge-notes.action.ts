import { Controller, Post, Body } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteTransferService } from '../../../domain/services/note-transfer-service/note-transfer.service';
import { MergeNotesDto } from './merge-notes.request.dto';
import { MergeNotesSwagger } from './merge-notes.swagger';

@Controller('notes')
export class MergeNotesAction {
  constructor(private readonly noteTransferService: NoteTransferService) {}

  @Post('merge')
  @ProtectedAction(MergeNotesSwagger)
  async apply(
    @Body() dto: MergeNotesDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ success: boolean; archivedNoteIds: number[] }> {
    await this.noteTransferService.mergeNotes(dto, authUser.userId);

    return {
      success: true,
      archivedNoteIds: dto.sources.map(s => s.noteId),
    };
  }
}
