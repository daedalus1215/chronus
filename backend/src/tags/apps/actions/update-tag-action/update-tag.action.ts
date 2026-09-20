import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { UpdateTagDto } from './update-tag.dto';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateTagSwagger } from './update-tag.swagger';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';

@Controller('tags')
export class UpdateTagAction {
  constructor(private readonly tagService: TagService) {}

  @Patch(':id')
  @ProtectedAction(UpdateTagSwagger)
  async updateTag(
    @Param('id', ParseIntPipe) tagId: number,
    @Body() updateTagDto: UpdateTagDto,
    @GetAuthUser('userId') userId: number
  ): Promise<TagResponseDto> {
    const tag = await this.tagService.updateTag(tagId, userId, updateTagDto);
    return new TagResponseDto(tag);
  }
}
