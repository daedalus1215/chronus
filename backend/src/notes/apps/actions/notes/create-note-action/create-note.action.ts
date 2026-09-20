import { Controller, Post, Body } from '@nestjs/common';
import { CreateNoteDto } from '../../../dtos/requests/create-note.dto';
import { NoteService } from 'src/notes/domain/services/note.service';
import { CreateNoteCommand } from 'src/notes/domain/transaction-scripts/create-note-TS/create-note.command';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { CreateNoteSwagger } from './create-note.swagger';
import { CreateNoteResponder } from './create-note.responder';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Controller('notes')
export class CreateNoteAction {
  constructor(
    private readonly noteService: NoteService,
    private readonly createNoteResponder: CreateNoteResponder
  ) {}

  @Post()
  @ProtectedAction(CreateNoteSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Body() createNoteDto: CreateNoteDto
  ): Promise<NoteResponseDto> {
    const command: CreateNoteCommand = {
      name: createNoteDto.name,
      userId,
      isMemo: createNoteDto.isMemo,
      folderId: createNoteDto.folderId,
    };
    const note = await this.noteService.createNote(command);
    return this.createNoteResponder.apply(note);
  }
}
