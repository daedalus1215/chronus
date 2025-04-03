import { Controller, Post, Body } from '@nestjs/common';
import { CreateNoteDto } from '../../dtos/requests/create-note.dto';
import { CreateNoteTransactionScript } from 'src/notes/domain/transaction-scripts/create-note.transaction.script';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { CreateNoteSwagger } from './create-note.swagger';
import { Note } from 'src/notes/domain/entities/notes/note.entity';

@Controller('notes')
export class CreateNoteAction {
  constructor(
    private readonly createNoteTransactionScript: CreateNoteTransactionScript
  ) {}

  @Post()
  @ProtectedAction(CreateNoteSwagger)
  async apply(
    @GetAuthUser('userId') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<Note> {
    return this.createNoteTransactionScript.apply({
      ...createNoteDto,
      userId,
    });
  }
} 