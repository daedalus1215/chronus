import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TagRepository } from '../../../infra/repositories/tag-repository/tag.repository';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetTagByIdSwagger } from './get-tag-by-id.swagger';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { NotFoundException } from '@nestjs/common';

@Controller('tags')
export class GetTagByIdAction {
  constructor(private readonly tagRepository: TagRepository) {}

  @Get(':id')
  @ProtectedAction(GetTagByIdSwagger)
  async getTagById(
    @Param('id', ParseIntPipe) tagId: number,
    @GetAuthUser('userId') userId: number
  ): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findTagByIdAndUserId(tagId, userId);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return new TagResponseDto(tag);
  }
}
