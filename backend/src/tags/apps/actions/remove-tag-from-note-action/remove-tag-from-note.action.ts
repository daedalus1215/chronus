import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { TagService } from 'src/tags/domain/services/tag.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { RemoveTagFromNoteSwagger } from './remove-tag-from-note.swagger';

@Controller('tags')
export class RemoveTagFromNoteAction {
  constructor(
    private readonly tagService: TagService
  ) {}

  @Delete(':tagId/remove-from-note/notes/:noteId')
  @ProtectedAction(RemoveTagFromNoteSwagger)
  async execute(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser('userId') userId: number
  ): Promise<{ success: boolean }> {
    await this.tagService.removeTagFromNote(tagId, noteId, userId);
    return { success: true };
  }
}
