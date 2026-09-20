import { Injectable } from '@nestjs/common';
import { Folder } from '../entities/folder.entity';
import {
  BulkReparentFoldersInput,
  BulkReparentFoldersTransactionScript,
} from '../transaction-scripts/bulk-reparent-folders-TS/bulk-reparent-folders.transaction.script';
import {
  CreateFolderInput,
  CreateFolderTransactionScript,
} from '../transaction-scripts/create-folder-TS/create-folder.transaction.script';
import { DeleteFolderTransactionScript } from '../transaction-scripts/delete-folder-TS/delete-folder.transaction.script';
import { GetFoldersByUserTransactionScript } from '../transaction-scripts/get-folders-by-user-TS/get-folders-by-user.transaction.script';
import {
  ReorderFoldersInput,
  ReorderFoldersTransactionScript,
} from '../transaction-scripts/reorder-folders-TS/reorder-folders.transaction.script';
import {
  UpdateFolderInput,
  UpdateFolderTransactionScript,
} from '../transaction-scripts/update-folder-TS/update-folder.transaction.script';

@Injectable()
export class FolderService {
  constructor(
    private readonly createFolderTransactionScript: CreateFolderTransactionScript,
    private readonly getFoldersByUserTransactionScript: GetFoldersByUserTransactionScript,
    private readonly updateFolderTransactionScript: UpdateFolderTransactionScript,
    private readonly deleteFolderTransactionScript: DeleteFolderTransactionScript,
    private readonly bulkReparentFoldersTransactionScript: BulkReparentFoldersTransactionScript,
    private readonly reorderFoldersTransactionScript: ReorderFoldersTransactionScript
  ) {}

  async createFolder(input: CreateFolderInput): Promise<Folder> {
    return this.createFolderTransactionScript.apply(input);
  }

  async getFoldersByUser(userId: number): Promise<Folder[]> {
    return this.getFoldersByUserTransactionScript.apply(userId);
  }

  async updateFolder(input: UpdateFolderInput): Promise<Folder> {
    return this.updateFolderTransactionScript.apply(input);
  }

  async deleteFolder(folderId: number, userId: number): Promise<void> {
    return this.deleteFolderTransactionScript.apply(folderId, userId);
  }

  async bulkReparentFolders(input: BulkReparentFoldersInput): Promise<Folder[]> {
    return this.bulkReparentFoldersTransactionScript.apply(input);
  }

  async reorderFolders(input: ReorderFoldersInput): Promise<void> {
    return this.reorderFoldersTransactionScript.apply(input);
  }
}
