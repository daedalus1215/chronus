import { Controller, Get } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetTagsByUserIdSwagger } from './get-tags-by-user-id.swagger';
import { GetTagsByUserIdProjection } from 'src/tags/domain/transaction-scripts/get-tags-by-user-id.projection';

@Controller('tags')
export class GetTagsByUserIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ProtectedAction(GetTagsByUserIdSwagger)
  async apply(
    @GetAuthUser('userId') userId: number
  ): Promise<GetTagsByUserIdProjection[]> {
    return this.tagService.getTagsByUserId(userId);
  }
}
