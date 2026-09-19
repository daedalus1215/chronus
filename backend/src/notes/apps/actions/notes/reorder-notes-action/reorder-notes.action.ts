import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteService } from 'src/notes/domain/services/note.service';
import { ReorderNotesDto } from './reorder-notes.dto';

@Controller('notes')
export class ReorderNotesAction {
  constructor(private readonly noteService: NoteService) {}

  @Patch('reorder')
  @HttpCode(204)
  @ProtectedAction({
    tag: 'Notes',
    summary: 'Reorder notes within the same folder',
  })
  async apply(
    @Body() dto: ReorderNotesDto,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    const folderId = dto.folderId === undefined ? null : (dto.folderId ?? null);
    await this.noteService.reorderNotes({ userId, items: dto.items, folderId });
  }
}
