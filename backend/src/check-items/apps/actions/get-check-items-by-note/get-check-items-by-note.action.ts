import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import { CheckItemService } from 'src/check-items/domain/services/check-item.service';
import { GetCheckItemsByNoteSwagger } from './get-check-items-by-note.swagger';
import { GetCheckItemsByNoteDto } from '../../dtos/requests/get-check-items-by-note.dto';

@Controller('check-items')
export class GetCheckItemsByNoteAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Get('notes/:noteId')
  @ProtectedAction(GetCheckItemsByNoteSwagger)
  async apply(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Query() queryDto: GetCheckItemsByNoteDto,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem[]> {
    const filters = {
      query: queryDto.query,
      status: queryDto.status,
      includeDone: queryDto.includeDone,
    };
    return await this.checkItemService.getCheckItemsByNoteId(
      noteId,
      authUser,
      filters
    );
  }
}
