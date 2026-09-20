import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { UpdateFolderTransactionScript } from 'src/folders/domain/transaction-scripts/update-folder-TS/update-folder.transaction.script';
import { FolderResponseDto } from 'src/folders/apps/dtos/responses/folder.response.dto';
import { UpdateFolderDto } from './update-folder.dto';

@Controller('folders')
export class UpdateFolderAction {
  constructor(private readonly updateFolderTS: UpdateFolderTransactionScript) {}

  @Patch(':id')
  @ProtectedAction({ tag: 'Folders', summary: 'Rename or move a folder' })
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFolderDto,
    @GetAuthUser('userId') userId: number
  ): Promise<FolderResponseDto> {
    const folder = await this.updateFolderTS.apply({ id, userId, ...dto });
    return new FolderResponseDto(folder);
  }
}
