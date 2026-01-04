import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UpdateNoteDto } from '../../../dtos/requests/update-note.dto';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateNoteSwagger } from './update-note.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from '../../../../domain/services/note.service';
import { UpdateNoteResponder } from './update-note.responder';

@Controller('notes')
export class UpdateNoteAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly updateNoteResponder: UpdateNoteResponder
  ) {}

  @Patch('detail/:id')
  @ProtectedAction(UpdateNoteSwagger)
  async apply(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    const noteId = parseInt(id, 10);
    const noteWithCheckItems = await this.noteService.updateNoteWithCheckItems(
      noteId,
      updateNoteDto,
      authUser.userId
    );
    return this.updateNoteResponder.apply(noteWithCheckItems);
  }
}
