import {
  Controller,
  Param,
  Patch,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notes')
@Controller('notes')
export class UpdateNoteTimestampAction {
  constructor(private readonly noteService: NoteService) {}

  @Patch(':id/timestamp')
  @HttpCode(204)
  @ProtectedAction({
    summary: 'Update note timestamp',
    tag: 'Notes',
    additionalResponses: [
      { status: 204, description: 'Note timestamp updated successfully.' },
      { status: 404, description: 'Note not found.' },
    ],
  })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    return this.noteService.updateNoteTimestamp(id, userId);
  }
}
