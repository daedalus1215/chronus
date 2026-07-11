import { Controller, Post, Body } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteTransferService } from '../../../domain/services/note-transfer-service/note-transfer.service';
import { ImportNoteSwagger } from './import-note.swagger';
import { ImportNoteDto } from '../../dtos/requests/import-note.dto';

@Controller('notes')
export class ImportNoteAction {
  constructor(private readonly noteTransferService: NoteTransferService) {}

  @Post('import')
  @ProtectedAction(ImportNoteSwagger)
  async apply(
    @Body() dto: ImportNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ noteId: number }> {
    const newNoteId = await this.noteTransferService.importNote(
      dto,
      authUser.userId
    );

    return { noteId: newNoteId };
  }
}
