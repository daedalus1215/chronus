import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UpdateNoteTitleDto } from 'src/notes/apps/dtos/requests/update-note-title.dto';
import { NoteService } from 'src/notes/domain/services/note.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateNoteTitleSwagger } from './update-note-title.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

/**
 * Handles the update of a note's title for a given note ID.
 */
@Controller('notes')
export class UpdateNoteTitleAction {
  constructor(private readonly noteService: NoteService) {}

  /**
   * Updates the title of a note by its ID.
   * @param id - The ID of the note to update.
   * @param updateNoteTitleDto - The DTO containing the new title.
   * @param authUser - The authenticated user.
   * @returns The updated note id and title.
   */
  @ProtectedAction(UpdateNoteTitleSwagger)
  @Patch('title/:id')
  async apply(
    @Param('id') id: string,
    @Body() updateNoteTitleDto: UpdateNoteTitleDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ id: number; name: string }> {
    return await this.noteService.updateNoteTitle(
      parseInt(id, 10),
      updateNoteTitleDto.name,
      authUser.userId
    );
  }
}
