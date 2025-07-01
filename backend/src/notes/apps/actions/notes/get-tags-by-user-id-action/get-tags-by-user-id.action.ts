import { Controller, Get } from '@nestjs/common';
import { GetTagsByUserIdTransactionScript } from '../../../../domain/transaction-scripts/get-tags-by-user-id.transaction.script';
import { TagResponseDto } from '../../../dtos/responses/tag.response.dto';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetTagsByUserIdSwagger } from './get-tags-by-user-id.swagger';

@Controller('tags')
export class GetTagsByUserIdAction {
  constructor(private readonly getTagsByUserIdTransactionScript: GetTagsByUserIdTransactionScript) {}

  @Get()
  @ProtectedAction(GetTagsByUserIdSwagger)
  async apply(@GetAuthUser('userId') userId: string): Promise<TagResponseDto[]> {
    return this.getTagsByUserIdTransactionScript.apply(userId);
  }
} 