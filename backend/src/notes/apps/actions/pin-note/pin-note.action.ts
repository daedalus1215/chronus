import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { NoteService } from 'src/notes/domain/services/note.service';
import { PinNoteSwagger } from './pin-note.swagger';
import { PinNoteDto } from './pin-note.dto';

@Controller('notes')
export class PinNoteAction {
  constructor(private readonly noteService: NoteService) {}

  @Patch(':id/pin')
  @ProtectedAction(PinNoteSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() pinNoteDto: PinNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<Note> {
    return await this.noteService.pinNote(id, authUser, pinNoteDto.pinned);
  }
}
