import { Controller, Get } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { FolderService } from 'src/folders/domain/services/folder.service';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';

@Controller('folders')
export class GetFoldersByUserAction {
  constructor(
    private readonly folderService: FolderService
  ) {}

  @Get()
  @ProtectedAction({ tag: 'Folders', summary: 'Get all folders for user' })
  async apply(
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto[]> {
    const folders = await this.folderService.getFoldersByUser(userId);
    return folders.map(f => new FolderResponseDto(f));
  }
}
