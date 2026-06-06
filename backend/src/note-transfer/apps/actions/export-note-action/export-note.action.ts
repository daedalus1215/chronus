import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from '../../../../shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteTransferService } from '../../../domain/services/note-transfer.service';
import { ExportNoteSwagger } from './export-note.swagger';

@Controller('notes')
export class ExportNoteAction {
  constructor(private readonly noteTransferService: NoteTransferService) {}

  @Get(':id/export')
  @ProtectedAction(ExportNoteSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser,
    @Res() res: Response
  ): Promise<void> {
    const noteId = parseInt(id, 10);

    const exportData = await this.noteTransferService.exportNote(
      noteId,
      authUser.userId
    );

    // Sanitize filename
    const sanitizedName = exportData.memo.name
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const filename = `${sanitizedName || 'memo'}.chronus`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json(exportData);
  }
}
