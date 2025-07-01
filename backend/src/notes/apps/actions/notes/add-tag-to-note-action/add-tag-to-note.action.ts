import { Controller, Patch, Param, Body } from '@nestjs/common';
import { AddTagToNoteTransactionScript } from '../../../../domain/transaction-scripts/add-tag-to-note.transaction.script';
import { AddTagToNoteDto } from '../../../dtos/requests/add-tag-to-note.dto';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { AddTagToNoteSwagger } from './add-tag-to-note.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

@Controller('notes')
export class AddTagToNoteAction {
  constructor(
    private readonly addTagToNoteTransactionScript: AddTagToNoteTransactionScript
  ) {}

  @Patch(':id/add-tag')
  @ProtectedAction(AddTagToNoteSwagger)
  async apply(
    @Param('id') id: string,
    @Body() body: Partial<AddTagToNoteDto>,
    @GetAuthUser('userId') userId: string
  ): Promise<NoteResponseDto> {
    return this.addTagToNoteTransactionScript.apply({
      noteId: parseInt(id, 10),
      userId,
      ...body,
    });
  }
} 