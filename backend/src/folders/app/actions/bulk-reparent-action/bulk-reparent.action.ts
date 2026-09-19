import { Body, Controller, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { BulkReparentFoldersTransactionScript } from 'src/folders/domain/transaction-scripts/bulk-reparent-folders.transaction-script';
import { FolderResponseDto } from 'src/folders/app/dtos/responses/folder.response.dto';
import { BulkReparentFoldersDto } from './bulk-reparent.dto';

@Controller('folders')
export class BulkReparentAction {
  constructor(
    private readonly bulkReparentFoldersTS: BulkReparentFoldersTransactionScript
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
    const folders = await this.bulkReparentFoldersTS.apply({
      userId,
      folderIds: dto.folderIds,
      parentId,
    });
    return folders.map(f => new FolderResponseDto(f));
  }
}
