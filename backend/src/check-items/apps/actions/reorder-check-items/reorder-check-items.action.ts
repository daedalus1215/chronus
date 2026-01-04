import { Controller, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ReorderCheckItemsDto } from '../../dtos/requests/reorder-check-items.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ReorderCheckItemsSwagger } from './reorder-check-items.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import { CheckItemService } from 'src/check-items/domain/services/check-item.service';

@Controller('check-items')
export class ReorderCheckItemsAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Put('notes/:noteId/reorder')
  @ProtectedAction(ReorderCheckItemsSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: ReorderCheckItemsDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem[]> {
    return await this.checkItemService.reorderCheckItems(noteId, authUser, dto);
  }
}
