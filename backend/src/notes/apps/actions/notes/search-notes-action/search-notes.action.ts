import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { SearchNotesResponder, SearchResult } from './search-notes.responder';

const VALID_STATUSES = ['ready', 'in_progress', 'review', 'done'] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export type SearchNotesOptions = {
  includeArchived?: boolean;
  status?: ValidStatus;
};

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
    @Query('includeArchived') includeArchived?: 'true' | 'false',
    @Query('status') status?: string
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    if (status && !VALID_STATUSES.includes(status as ValidStatus)) {
      throw new BadRequestException(
        `Invalid status value: "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    const options: SearchNotesOptions = {};
    if (includeArchived === 'true') {
      options.includeArchived = true;
    }
    if (status) {
      options.status = status as ValidStatus;
    }

    const results = await this.noteService.search(
      userId,
      query.trim(),
      options
    );
    return this.searchNotesResponder.apply(results);
  }
}
