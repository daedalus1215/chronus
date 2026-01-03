import { Controller, Get, Param } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetNoteByIdSwagger } from './get-note-by-id.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from '../../../../domain/services/note.service';
import { GetNoteByIdResponder } from './get-note-by-id.responder';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Controller('notes')
export class GetNoteByIdAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly getNoteByIdResponder: GetNoteByIdResponder,
  ) {}

  @Get('/detail/:id')
  @ProtectedAction(GetNoteByIdSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    const noteId = parseInt(id, 10);
    const noteWithCheckItems = await this.noteService.getNoteByIdWithCheckItems(noteId, authUser.userId);
    return this.getNoteByIdResponder.apply(noteWithCheckItems);
  }
} 