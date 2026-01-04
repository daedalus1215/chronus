import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateCheckItemDto } from '../../dtos/requests/create-check-item.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { CreateCheckItemSwagger } from './create-check-item.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import { CheckItemService } from 'src/check-items/domain/services/check-item.service';

@Controller('check-items')
export class CreateCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Post('/notes/:noteId')
  @ProtectedAction(CreateCheckItemSwagger)
  async apply(
    @Body() dto: CreateCheckItemDto,
    @Param('noteId', ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem[]> {
    return await this.checkItemService.createCheckItem({
      checkItem: dto,
      authUser,
      noteId,
    });
  }
}
