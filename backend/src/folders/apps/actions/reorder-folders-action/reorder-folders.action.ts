import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';
import { ReorderFoldersDto } from './reorder-folders.dto';

@Controller('folders')
export class ReorderFoldersAction {
  constructor(
    private readonly folderService: FolderService
  ) {}

  @Patch('reorder')
  @HttpCode(204)
  @ProtectedAction({
    tag: 'Folders',
    summary: 'Reorder folders within the same parent',
  })
  async apply(
    @Body() dto: ReorderFoldersDto,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    const parentId = dto.parentId === undefined ? null : (dto.parentId ?? null);
    await this.folderService.reorderFolders({ userId, items: dto.items, parentId });
  }
}
