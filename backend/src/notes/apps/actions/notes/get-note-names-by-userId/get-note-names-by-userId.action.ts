import { Controller, Get, Query } from '@nestjs/common';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { GetNoteNamesByUserIdSwagger } from './get-note-names-by-userId.swagger';

type GetNoteNamesResponse = {
  notes: { name: string; id: number; isMemo: number }[];
  hasMore: boolean;
  nextCursor: number | null;
};

@Controller('notes')
export class GetNoteNamesByUserIdAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Get('names')
  @ProtectedAction(GetNoteNamesByUserIdSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Query('cursor') cursor: number = 0,
    @Query('limit') limit: number = 20,
    @Query('query') query?: string,
    @Query('type') type?: 'memo' | 'checklist',
    @Query('tagId') tagId?: string
  ): Promise<GetNoteNamesResponse> {
    const notes = await this.noteRepository.getNoteNamesByUserId(
      userId,
      cursor,
      limit,
      query,
      type,
      tagId
    );
    const hasMore = notes.length === limit;

    const nextCursor = cursor + limit + 1;

    return {
      notes,
      hasMore,
      nextCursor,
    };
  }
}
