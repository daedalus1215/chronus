import { Controller, Get, Param } from '@nestjs/common';
import { GetCheckItemTransactionScript } from 'src/notes/domain/transaction-scripts/get-check-item.transaction.script';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { CheckItemResponseDto } from '../../../dtos/responses/check-item.response.dto';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { GetCheckItemSwagger } from './get-check-item.swagger';

@Controller('notes')
export class GetCheckItemAction {
  constructor(
    private readonly getCheckItemTransactionScript: GetCheckItemTransactionScript
  ) {}

  @Get('check-items/:id')
  @ProtectedAction(GetCheckItemSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItemResponseDto> {
    const checkItem = await this.getCheckItemTransactionScript.apply(
      parseInt(id, 10),
      authUser
    );
    return new CheckItemResponseDto(checkItem);
  }
} 