import { Injectable } from '@nestjs/common';
import { FolderRepository } from '../../infra/repositories/folder.repository';
import { Folder } from '../entities/folder.entity';

@Injectable()
export class GetFoldersByUserTransactionScript {
  constructor(private readonly folderRepository: FolderRepository) {}

  async apply(userId: number): Promise<Folder[]> {
    return this.folderRepository.findAllByUserId(userId);
  }
}
