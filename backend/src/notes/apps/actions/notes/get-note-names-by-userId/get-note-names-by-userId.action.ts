import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { GetNoteNamesByUserIdSwagger, GetNoteNamesByUserIdApiQueries } from './get-note-names-by-userId.swagger';

type GetNoteNamesResponse = {
  notes: {name: string, id: number, isMemo: number}[];
  hasMore: boolean;
  nextCursor: number | null;
}

@Controller('notes')
export class GetNoteNamesByUserIdAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Get('names')
  @ProtectedAction(GetNoteNamesByUserIdSwagger)
  async apply(
    @GetAuthUser('userId') userId: string,
    @Query('cursor') cursor: number = 0,
    @Query('limit') limit: number = 20,
    @Query('query') query?: string,
    @Query('type') type?: 'memo' | 'checkList',
    @Query('tagId') tagId?: string
  ): Promise<GetNoteNamesResponse> {
    const notes = await this.noteRepository.getNoteNamesByUserId(userId, cursor, limit, query, type, tagId);
    const hasMore = notes.length === limit;
    
    const nextCursor = cursor + limit + 1;

    return {
      notes,
      hasMore,
      nextCursor
    };
  }
}
