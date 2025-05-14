import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UpdateNoteTransactionScript } from '../../../../domain/transaction-scripts/update-note-TS/update-note.transaction.script';
import { UpdateNoteDto } from '../../../dtos/requests/update-note.dto';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { UpdateNoteSwagger } from './update-note.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

@Controller('notes')
export class UpdateNoteAction {
  constructor(
    private readonly updateNoteTransactionScript: UpdateNoteTransactionScript
  ) {}

  @Patch('detail/:id')
  @ProtectedAction(UpdateNoteSwagger)
  async apply(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto, 
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    return await this.updateNoteTransactionScript.apply(parseInt(id, 10), updateNoteDto, authUser.userId);
  }
} 