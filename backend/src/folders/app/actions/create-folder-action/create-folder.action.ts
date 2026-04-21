import { Body, Controller, Post } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CreateFolderTransactionScript } from 'src/folders/domain/transaction-scripts/create-folder.transaction-script';
import { FolderResponseDto } from 'src/folders/app/dtos/responses/folder.response.dto';
import { CreateFolderDto } from './dtos/create-folder.dto';

@Controller('folders')
export class CreateFolderAction {
  constructor(private readonly createFolderTS: CreateFolderTransactionScript) {}

  @Post()
  @ProtectedAction({ tag: 'Folders', summary: 'Create a new folder' })
  async apply(
    @Body() dto: CreateFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto> {
    const folder = await this.createFolderTS.apply({ ...dto, userId });
    return new FolderResponseDto(folder);
  }
}
