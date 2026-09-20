import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetTagByIdSwagger } from './get-tag-by-id.swagger';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';

@Controller('tags')
export class GetTagByIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get(':id')
  @ProtectedAction(GetTagByIdSwagger)
  async getTagById(
    @Param('id', ParseIntPipe) tagId: number,
    @GetAuthUser('userId') userId: number
  ): Promise<TagResponseDto> {
    const tag = await this.tagService.getTagById(tagId, userId);
    return new TagResponseDto(tag);
  }
}
