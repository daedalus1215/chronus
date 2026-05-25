import { Controller, Get, Query } from '@nestjs/common';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

type ExplorerNoteItem = {
  name: string;
  id: number;
  isMemo: number;
  folderId: number | null;
};

@Controller('notes')
export class GetNoteNamesForExplorerAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Get('explorer-names')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Get note names for the explorer, optionally filtered by folder',
  })
  async apply(
    @GetAuthUser('userId') userId: number,
    @Query('folderId') folderId?: string
  ): Promise<ExplorerNoteItem[]> {
    return this.noteRepository.getNoteNamesForExplorer(userId, folderId);
  }
}
