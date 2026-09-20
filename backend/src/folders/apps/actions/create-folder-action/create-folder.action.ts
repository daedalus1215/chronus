import { Body, Controller, Post } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';
import { CreateFolderDto } from './create-folder.dto';

@Controller('folders')
export class CreateFolderAction {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @ProtectedAction({ tag: 'Folders', summary: 'Create a new folder' })
  async apply(
    @Body() dto: CreateFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto> {
    const folder = await this.folderService.createFolder({ ...dto, userId });
    return new FolderResponseDto(folder);
  }
}
