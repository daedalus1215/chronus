import { Controller, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ConvertChecklistToMemoSwagger } from './convert-checklist-to-memo.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from '../../../../domain/services/note.service';
import { GetNoteByIdResponder } from '../get-note-by-id-action/get-note-by-id.responder';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Controller('notes')
export class ConvertChecklistToMemoAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly getNoteByIdResponder: GetNoteByIdResponder
  ) {}

  @Patch(':id/convert-to-memo')
  @ProtectedAction(ConvertChecklistToMemoSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    const noteWithCheckItems = await this.noteService.convertChecklistToMemo(
      id,
      authUser.userId
    );
    return this.getNoteByIdResponder.apply(noteWithCheckItems);
  }
}
