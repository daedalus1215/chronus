import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { MoveNoteToFolderTransactionScript } from 'src/notes/domain/transaction-scripts/move-note-to-folder.transaction-script';
import { MoveNoteToFolderDto } from './move-note-to-folder.dto';

@Controller('notes')
export class MoveNoteToFolderAction {
  constructor(private readonly moveNoteTS: MoveNoteToFolderTransactionScript) {}

  @Patch(':id/folder')
  @HttpCode(200)
  @ProtectedAction({ tag: 'Notes', summary: 'Move note to a folder' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveNoteToFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<{ id: number; folderId: number | null }> {
    const note = await this.moveNoteTS.apply(id, userId, dto.folderId);
    return { id: note.id, folderId: note.folderId };
  }
}
