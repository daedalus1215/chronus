import { Controller, Get, Param } from '@nestjs/common';
import { GetNoteByIdTransactionScript } from '../../../../domain/transaction-scripts/get-note-by-id.transaction.script';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetNoteByIdSwagger } from './get-note-by-id.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator'; 
import { CheckItem } from 'src/notes/domain/entities/notes/check-item.entity';

@Controller('notes')
export class GetNoteByIdAction {
  constructor(
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript
  ) {}

  @Get('/detail/:id')
  @ProtectedAction(GetNoteByIdSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<{
    id: number;
    name: string;
    description?: string;
    checkItems: CheckItem[];
    isMemo: boolean;
  }> {
    const note = await this.getNoteByIdTransactionScript.apply(parseInt(id, 10), authUser.userId);
    return {
      ...note,
      description: note.memo?.description || '',
      isMemo: note.memo !== null,
    };
  }
} 