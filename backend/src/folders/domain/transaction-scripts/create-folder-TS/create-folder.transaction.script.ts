import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../../infra/repositories/folder.repository';
import { Folder } from '../../entities/folder.entity';

export type CreateFolderInput = { name: string; parentId?: number | null; userId: number };

@Injectable()
export class CreateFolderTransactionScript {
  constructor(private readonly folderRepository: FolderRepository) {}

  async apply(input: CreateFolderInput): Promise<Folder> {
    return this.folderRepository.create({
      name: input.name,
      parentId: input.parentId ?? null,
      userId: input.userId,
    });
  }
}
