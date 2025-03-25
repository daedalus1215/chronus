import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetNoteByIdTransactionScript } from '../../domain/transaction-scripts/get-note-by-id.transaction.script';
import { NoteResponseDto } from '../dtos/responses/note.response.dto';

@ApiTags('Notes')
@Controller('notes')
export class GetNoteByIdAction {
  constructor(
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript
  ) {}

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, description: 'Returns the note.', type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async apply(@Param('id') id: string): Promise<NoteResponseDto> {
    return await this.getNoteByIdTransactionScript.apply(parseInt(id, 10));
  }
} 