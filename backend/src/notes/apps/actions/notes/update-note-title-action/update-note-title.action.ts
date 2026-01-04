import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UpdateNoteTitleTransactionScript } from 'src/notes/domain/transaction-scripts/update-note-title.transaction.script';
import { UpdateNoteTitleDto } from 'src/notes/apps/dtos/requests/update-note-title.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateNoteTitleSwagger } from './update-note-title.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

/**
 * Handles the update of a note's title for a given note ID.
 */
@Controller('notes')
export class UpdateNoteTitleAction {
  constructor(
    private readonly updateNoteTitleTransactionScript: UpdateNoteTitleTransactionScript
  ) {}

  /**
   * Updates the title of a note by its ID.
   * @param id - The ID of the note to update.
   * @param updateNoteTitleDto - The DTO containing the new title.
   * @param authUser - The authenticated user.
   * @returns The updated note as a NoteResponseDto.
   */
  @ProtectedAction(UpdateNoteTitleSwagger)
  @Patch('title/:id')
  async apply(
    @Param('id') id: string,
    @Body() updateNoteTitleDto: UpdateNoteTitleDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{ id: number; name: string }> {
    return await this.updateNoteTitleTransactionScript.apply(
      parseInt(id, 10),
      updateNoteTitleDto,
      authUser.userId
    );
  }
}
