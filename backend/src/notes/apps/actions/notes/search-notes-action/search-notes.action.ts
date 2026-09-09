import { Controller, Get, Query } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { SearchNotesResponder, SearchResult } from './search-notes.responder';

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
    @Query('query') query?: string
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    const results = await this.noteService.search(userId, query.trim());
    return this.searchNotesResponder.apply(results);
  }
}
