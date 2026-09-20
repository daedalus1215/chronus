import {
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';

@Controller('folders')
export class DeleteFolderAction {
  constructor(private readonly folderService: FolderService) {}

  @Delete(':id')
  @HttpCode(204)
  @ProtectedAction({
    tag: 'Folders',
    summary: 'Delete folder and all subfolders; notes return to root',
  })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser('userId') userId: number
  ): Promise<void> {
    await this.folderService.deleteFolder(id, userId);
  }
}
