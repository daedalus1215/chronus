import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateCheckItemDto } from '../../../dtos/requests/create-check-item.dto';
import { CreateCheckItemTransactionScript } from 'src/notes/domain/transaction-scripts/create-check-item.transaction.script';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { CreateCheckItemSwagger } from './create-check-item.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { CheckItem } from 'src/notes/domain/entities/notes/check-item.entity';

@Controller('notes')
export class CreateCheckItemAction {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript
  ) {}

  @Post(':noteId/check-items')
  @ProtectedAction(CreateCheckItemSwagger)
  async apply(
    @Body() createCheckItemDto: CreateCheckItemDto,
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{checkItems: CheckItem[]}> {
    return await this.createCheckItemTransactionScript.apply({...createCheckItemDto, authUser, noteId,});
  }
} 