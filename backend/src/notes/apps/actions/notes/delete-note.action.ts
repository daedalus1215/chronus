import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';

@Controller('notes')
export class DeleteNoteAction {
  constructor(private readonly noteService: NoteService) {}

  @Delete(':id')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Delete a note by ID',
    additionalResponses: [
      { status: 204, description: 'Note deleted successfully.' },
      { status: 404, description: 'Note not found.' },
    ],
  })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    await this.noteService.deleteNote(id, userId);
  }
}
