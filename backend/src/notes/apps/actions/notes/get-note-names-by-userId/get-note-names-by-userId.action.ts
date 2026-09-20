import { Controller, Get, Query } from '@nestjs/common';
import { NoteService } from 'src/notes/domain/services/note.service';
import type { GetNoteNamesResult } from 'src/notes/domain/transaction-scripts/get-note-names-by-user-id-TS/get-note-names-by-user-id.transaction.script';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { GetNoteNamesByUserIdSwagger } from './get-note-names-by-userId.swagger';

@Controller('notes')
export class GetNoteNamesByUserIdAction {
  constructor(private readonly noteService: NoteService) {}

  @Get('names')
  @ProtectedAction(GetNoteNamesByUserIdSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Query('cursor') cursor: number = 0,
    @Query('limit') limit: number = 20,
    @Query('query') query?: string,
    @Query('type') type?: 'memo' | 'checklist',
    @Query('tagId') tagId?: string
  ): Promise<GetNoteNamesResult> {
    return this.noteService.getNoteNamesByUserId({
      userId,
      cursor,
      limit,
      query,
      type,
      tagId,
    });
  }
}
