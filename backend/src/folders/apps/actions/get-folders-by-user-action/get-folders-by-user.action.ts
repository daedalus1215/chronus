import { Controller, Get } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { GetFoldersByUserTransactionScript } from 'src/folders/domain/transaction-scripts/get-folders-by-user-TS/get-folders-by-user.transaction.script';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';

@Controller('folders')
export class GetFoldersByUserAction {
  constructor(
    private readonly getFoldersByUserTS: GetFoldersByUserTransactionScript
  ) {}

  @Get()
  @ProtectedAction({ tag: 'Folders', summary: 'Get all folders for user' })
  async apply(
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto[]> {
    const folders = await this.getFoldersByUserTS.apply(userId);
    return folders.map(f => new FolderResponseDto(f));
  }
}
