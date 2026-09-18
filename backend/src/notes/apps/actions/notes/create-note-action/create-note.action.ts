import { Controller, Post, Body } from '@nestjs/common';
import { CreateNoteDto } from '../../../dtos/requests/create-note.dto';
import { NoteService } from 'src/notes/domain/services/note.service';
import { CreateNoteCommand } from 'src/notes/domain/transaction-scripts/create-note.command';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { CreateNoteSwagger } from './create-note.swagger';
import { Note } from 'src/notes/domain/entities/notes/note.entity';

@Controller('notes')
export class CreateNoteAction {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ProtectedAction(CreateNoteSwagger)
  async apply(
    @GetAuthUser('userId') userId: number,
    @Body() createNoteDto: CreateNoteDto
  ): Promise<Note> {
    const command: CreateNoteCommand = {
      name: createNoteDto.name,
      userId,
      isMemo: createNoteDto.isMemo,
      folderId: createNoteDto.folderId,
    };
    return this.noteService.createNote(command);
  }
}
