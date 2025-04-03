import { Controller, Get, Param } from '@nestjs/common';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { GetNoteNamesByUserIdSwagger } from './get-note-names-by-userId.swagger';

@Controller('notes')
export class GetNoteNamesByUserIdAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Get('names')
  @ProtectedAction(GetNoteNamesByUserIdSwagger)
  async apply(
    @GetAuthUser('userId') userId: string
  ): Promise<{name: string, id: number}[]> {
    return await this.noteRepository.getNoteNamesByUserId(userId);
  }
}
