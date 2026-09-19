import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TagService } from '../../../domain/services/tag.service';
import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import {
  AuthUser,
  GetAuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetTagsByNoteIdSwagger } from './get-tags-by-note-id.swagger';

@Controller('tags')
export class GetTagsByNoteIdAction {
  constructor(private readonly tagService: TagService) {}

  @Get('/note/:id')
  @ProtectedAction(GetTagsByNoteIdSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() _user: AuthUser
  ): Promise<TagResponseDto[]> {
    return this.tagService.getTagsByNoteId(id);
  }
}
