import { Controller, Post, Param, NotFoundException } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { LoadNoteVersionSwagger } from './load-note-version.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteVersionRepository } from '../../../../infra/repositories/note-version.repository';
import { NoteService } from '../../../../domain/services/note.service';
import { LoadNoteVersionResponder } from './load-note-version.responder';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Controller('notes')
export class LoadNoteVersionAction {
  constructor(
    private readonly noteVersionRepository: NoteVersionRepository,
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

    // Find the version and verify ownership
    const version = await this.noteVersionRepository.findById(
      vid,
      nid,
      authUser.userId
    );
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // Update the note's description — this goes through the normal update
    // flow, but skips version capture since we're restoring from history.
    const noteWithCheckItems = await this.noteService.updateNoteWithCheckItems(
      nid,
      { description: version.description, skipVersionCapture: true },
      authUser.userId
    );

    return this.responder.apply(noteWithCheckItems);
  }
}
