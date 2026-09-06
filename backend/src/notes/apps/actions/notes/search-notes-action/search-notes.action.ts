import { Controller, Get, Query } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { SearchNotesResponder, SearchResult } from './search-notes.responder';

function parseIncludeArchived(val: string | undefined): boolean {
  if (val === undefined) return false;
  return val === 'true';
}

@Controller('notes')
export class SearchNotesAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly searchNotesResponder: SearchNotesResponder
  ) {}

  @Get('search')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Fuzzy search across all notes, memos, and checklists',
  })
  async apply(
    @GetAuthUser('userId') userId: number,
    @Query('query') query?: string,
    @Query('includeArchived') includeArchived?: string
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    const results = await this.noteService.search(userId, query.trim(), {
      includeArchived: parseIncludeArchived(includeArchived),
    });
    return this.searchNotesResponder.apply(results);
  }
}
