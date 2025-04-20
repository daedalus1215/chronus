import { Controller, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateNoteTransactionScript } from '../../domain/transaction-scripts/update-note-TS/update-note.transaction.script';
import { UpdateNoteDto } from '../dtos/requests/update-note.dto';
import { NoteResponseDto } from '../dtos/responses/note.response.dto';

@ApiTags('Notes')
@Controller('notes')
export class UpdateNoteAction {
  constructor(
    private readonly updateNoteTransactionScript: UpdateNoteTransactionScript
  ) {}

  @Patch('detail/:id')
  @ApiOperation({ summary: 'Update a note by ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully.', type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  async apply(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto
  ): Promise<NoteResponseDto> {
    console.log(updateNoteDto);
    return await this.updateNoteTransactionScript.apply(parseInt(id, 10), updateNoteDto);
  }
} 