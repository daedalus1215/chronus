import { Controller, Patch, Param } from '@nestjs/common';
import { ToggleCheckItemTransactionScript } from 'src/notes/domain/transaction-scripts/toggle-check-item.transaction.script';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { ToggleCheckItemSwagger } from './toggle-check-item.swagger';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { CheckItemResponseDto } from '../../../dtos/responses/check-item.response.dto';

@Controller('notes')
export class ToggleCheckItemAction {
  constructor(
    private readonly toggleCheckItemTransactionScript: ToggleCheckItemTransactionScript
  ) {}

  @Patch('check-items/:id/toggle')
  @ProtectedAction(ToggleCheckItemSwagger)
  async apply(
    @Param('id') id: string,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItemResponseDto> {
    const checkItem = await this.toggleCheckItemTransactionScript.apply(
      parseInt(id, 10),
      authUser
    );
    return new CheckItemResponseDto(checkItem);
  }
}
