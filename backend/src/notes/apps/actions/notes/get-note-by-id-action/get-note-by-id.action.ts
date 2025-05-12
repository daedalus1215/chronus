import { Controller, Get, Param } from '@nestjs/common';
import { GetNoteByIdTransactionScript } from '../../../../domain/transaction-scripts/get-note-by-id.transaction.script';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetNoteByIdSwagger } from './get-note-by-id.swagger';

@Controller('notes')
export class GetNoteByIdAction {
  constructor(
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript
  ) {}

  @Get('detail/:id')
  @ProtectedAction(GetNoteByIdSwagger)
  async apply(
    @Param('id') id: string,
  ): Promise<NoteResponseDto> {
    return await this.getNoteByIdTransactionScript.apply(parseInt(id, 10));
  }
} 