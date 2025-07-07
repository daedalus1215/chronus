import { Controller, Get } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/time-tracks/apps/decorators/protected-action.decorator';
import { GetTagsByUserIdSwagger } from './get-tags-by-user-id.swagger';

@Controller('tags')
export class GetTagsByUserIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ProtectedAction(GetTagsByUserIdSwagger)
  async apply(@GetAuthUser('userId') userId: string): Promise<TagResponseDto[]> {
    return this.tagService.getTagsByUserId(userId);
  }
} 