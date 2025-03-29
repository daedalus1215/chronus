import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateNoteDto } from '../dtos/requests/create-note.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateNoteTransactionScript } from 'src/notes/domain/transaction-scripts/create-note.transaction.script';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetAuthUser } from 'src/auth/get-auth-user.decorator';

@ApiTags('Notes')
@Controller('notes')
@ApiBearerAuth()
export class CreateNoteAction {
  constructor(readonly createNoteTransactionScript: CreateNoteTransactionScript) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'The note has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createNote(
    @GetAuthUser('userId') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.createNoteTransactionScript.apply({
      ...createNoteDto,
      userId,
    });
  }
}