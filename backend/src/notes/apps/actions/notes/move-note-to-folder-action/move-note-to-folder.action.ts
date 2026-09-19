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
import { NoteService } from 'src/notes/domain/services/note.service';
import { MoveNoteToFolderDto } from './move-note-to-folder.dto';

@Controller('notes')
export class MoveNoteToFolderAction {
  constructor(private readonly noteService: NoteService) {}

  @Patch(':id/folder')
  @HttpCode(200)
  @ProtectedAction({ tag: 'Notes', summary: 'Move note to a folder' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveNoteToFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<{ id: number; folderId: number | null }> {
    const note = await this.noteService.moveNoteToFolder(
      id,
      userId,
      dto.folderId
    );
    return { id: note.id, folderId: note.folderId };
  }
}
