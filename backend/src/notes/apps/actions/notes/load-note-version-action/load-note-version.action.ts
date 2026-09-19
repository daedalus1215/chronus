import { Controller, Post, Param } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { LoadNoteVersionSwagger } from './load-note-version.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { LoadNoteVersionResponder } from './load-note-version.responder';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Controller('notes')
export class LoadNoteVersionAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly responder: LoadNoteVersionResponder
  ) {}

  @Post(':noteId/versions/:versionId/load')
  @ProtectedAction(LoadNoteVersionSwagger)
  async apply(
    @Param('noteId') noteId: string,
    @Param('versionId') versionId: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    const nid = parseInt(noteId, 10);
    const vid = parseInt(versionId, 10);

    const noteWithCheckItems = await this.noteService.loadNoteVersion(
      nid,
      vid,
      authUser.userId
    );

    return this.responder.apply(noteWithCheckItems);
  }
}
