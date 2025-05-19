import { Controller, Patch, Param, Body } from '@nestjs/common';
import { UpdateNoteTitleTransactionScript } from '../../../../domain/transaction-scripts/update-note-TS/update-note-title.transaction.script';
import { UpdateNoteTitleDto } from '../../../dtos/requests/update-note-title.dto';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { UpdateNoteTitleSwagger } from './update-note-title.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

@Controller('notes')
export class UpdateNoteTitleAction {
  constructor(
    private readonly updateNoteTitleTransactionScript: UpdateNoteTitleTransactionScript
  ) {}

  @Patch('title/:id')
  @ProtectedAction(UpdateNoteTitleSwagger)
  async apply(
    @Param('id') id: string,
    @Body() updateNoteTitleDto: UpdateNoteTitleDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<NoteResponseDto> {
    return await this.updateNoteTitleTransactionScript.apply(parseInt(id, 10), updateNoteTitleDto, authUser.userId);
  }
} 