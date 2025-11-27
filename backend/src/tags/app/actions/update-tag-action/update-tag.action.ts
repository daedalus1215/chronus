import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UpdateTagTransactionScript } from '../../../domain/transaction-scripts/update-tag.transaction.script';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { UpdateTagSwagger } from './update-tag.swagger';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';

@Controller('tags')
export class UpdateTagAction {
  constructor(private readonly updateTagTS: UpdateTagTransactionScript) {}

  @Patch(':id')
  @ProtectedAction(UpdateTagSwagger)
  async updateTag(
    @Param('id', ParseIntPipe) tagId: number,
    @Body() updateTagDto: UpdateTagDto,
    @GetAuthUser('userId') userId: number
  ): Promise<TagResponseDto> {
    const tag = await this.updateTagTS.apply(tagId, userId, updateTagDto);
    return new TagResponseDto(tag);
  }
}

