import { Controller, Get, Param } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetNoteVersionsSwagger } from './get-note-versions.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteVersionRepository } from '../../../../infra/repositories/note-version.repository';
import { GetNoteVersionsResponder } from './get-note-versions.responder';
import { NoteVersionResponseDto } from '../../../dtos/responses/note-version.response.dto';

@Controller('notes')
export class GetNoteVersionsAction {
  constructor(
    private readonly noteVersionRepository: NoteVersionRepository,
    private readonly responder: GetNoteVersionsResponder
  ) {}

  @Get(':id/versions')
  @ProtectedAction(GetNoteVersionsSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ versions: NoteVersionResponseDto[]; total: number }> {
    const noteId = parseInt(id, 10);
    const versions = await this.noteVersionRepository.findByNoteId(
      noteId,
      authUser.userId
    );
    return this.responder.apply(versions);
  }
}
