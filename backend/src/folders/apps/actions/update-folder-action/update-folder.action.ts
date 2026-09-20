import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';
import { UpdateFolderDto } from './update-folder.dto';

@Controller('folders')
export class UpdateFolderAction {
  constructor(private readonly folderService: FolderService) {}

  @Patch(':id')
  @ProtectedAction({ tag: 'Folders', summary: 'Rename or move a folder' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto> {
    const folder = await this.folderService.updateFolder({ id, userId, ...dto });
    return new FolderResponseDto(folder);
  }
}
