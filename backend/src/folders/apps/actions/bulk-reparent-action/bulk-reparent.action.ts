import { Body, Controller, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';
import { BulkReparentFoldersDto } from './bulk-reparent.dto';

@Controller('folders')
export class BulkReparentAction {
  constructor(
    private readonly folderService: FolderService
  ) {}

  @Patch('bulk-reparent')
  @ProtectedAction({
    tag: 'Folders',
    summary:
      'Move two or more folders to a new parent in one transaction (nested selection moves roots only)',
  })
  async apply(
    @Body() dto: BulkReparentFoldersDto,
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto[]> {
    const parentId = dto.parentId === undefined ? null : dto.parentId;
    const folders = await this.folderService.bulkReparentFolders({
      userId,
      folderIds: dto.folderIds,
      parentId,
    });
    return folders.map(f => new FolderResponseDto(f));
  }
}
