import { Controller, Delete, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

@Controller('notes')
export class DeleteNoteAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Delete(':id')
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Delete a note by ID',
    additionalResponses: [
      { status: 204, description: 'Note deleted successfully.' },
      { status: 404, description: 'Note not found.' }
    ]
  })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    //@TODO: Move to a TS, under a service
    const note = await this.noteRepository.findById(id, userId);
    if (!note) throw new NotFoundException('Note not found');
    await this.noteRepository.deleteNoteById(id, userId);
  }
} 