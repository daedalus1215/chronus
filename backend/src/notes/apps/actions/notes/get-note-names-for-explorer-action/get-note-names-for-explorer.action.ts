import { Controller, Get, Query } from '@nestjs/common';
import { NoteService } from 'src/notes/domain/services/note.service';
import { NoteNameRow } from 'src/notes/domain/transaction-scripts/note-name-row.projection';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

@Controller('notes')
export class GetNoteNamesForExplorerAction {
  constructor(private readonly noteService: NoteService) {}

  @Get('explorer-names')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Get note names for the explorer, optionally filtered by folder',
  })
  async apply(
    @GetAuthUser('userId') userId: number,
    @Query('folderId') folderId?: string
  ): Promise<NoteNameRow[]> {
    return this.noteService.getNoteNamesForExplorer(userId, folderId);
  }
}
