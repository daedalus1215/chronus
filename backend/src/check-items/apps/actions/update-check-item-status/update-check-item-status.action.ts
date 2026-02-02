import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateCheckItemStatusSwagger } from './update-check-item-status.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import { CheckItemService } from 'src/check-items/domain/services/check-item.service';
import { UpdateCheckItemStatusDto } from '../../dtos/requests/update-check-item-status.dto';

@Controller('check-items')
export class UpdateCheckItemStatusAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Patch('/items/:id/status')
  @ProtectedAction(UpdateCheckItemStatusSwagger)
  async apply(
    @Body() dto: UpdateCheckItemStatusDto,
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.checkItemService.updateCheckItemStatus(id, dto, authUser);
  }
}
