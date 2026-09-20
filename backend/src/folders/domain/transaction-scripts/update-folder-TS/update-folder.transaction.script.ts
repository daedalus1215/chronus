import { Injectable, NotFoundException } from '@nestjs/common';
import { FolderRepository } from '../../../infra/repositories/folder.repository';
import { Folder } from '../../entities/folder.entity';

type Input = {
  id: number;
  userId: number;
  name?: string;
  parentId?: number | null;
};

@Injectable()
export class UpdateFolderTransactionScript {
  constructor(private readonly folderRepository: FolderRepository) {}

  async apply(input: Input): Promise<Folder> {
    const folder = await this.folderRepository.findById(input.id, input.userId);
    if (!folder) throw new NotFoundException('Folder not found');

    if (input.name !== undefined) folder.name = input.name;
    if ('parentId' in input) folder.parentId = input.parentId ?? null;

    return this.folderRepository.update(folder);
  }
}
