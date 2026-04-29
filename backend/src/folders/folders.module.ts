import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './domain/entities/folder.entity';
import { FolderRepository } from './infra/repositories/folder.repository';
import { CreateFolderTransactionScript } from './domain/transaction-scripts/create-folder.transaction-script';
import { GetFoldersByUserTransactionScript } from './domain/transaction-scripts/get-folders-by-user.transaction-script';
import { UpdateFolderTransactionScript } from './domain/transaction-scripts/update-folder.transaction-script';
import { DeleteFolderTransactionScript } from './domain/transaction-scripts/delete-folder.transaction-script';
import { BulkReparentFoldersTransactionScript } from './domain/transaction-scripts/bulk-reparent-folders.transaction-script';
import { ReorderFoldersTransactionScript } from './domain/transaction-scripts/reorder-folders.transaction-script';
import { CreateFolderAction } from './app/actions/create-folder-action/create-folder.action';
import { GetFoldersByUserAction } from './app/actions/get-folders-by-user-action/get-folders-by-user.action';
import { BulkReparentAction } from './app/actions/bulk-reparent-action/bulk-reparent.action';
import { UpdateFolderAction } from './app/actions/update-folder-action/update-folder.action';
import { DeleteFolderAction } from './app/actions/delete-folder-action/delete-folder.action';
import { ReorderFoldersAction } from './app/actions/reorder-folders-action/reorder-folders.action';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), NotesModule],
  providers: [
    FolderRepository,
    CreateFolderTransactionScript,
    GetFoldersByUserTransactionScript,
    UpdateFolderTransactionScript,
    DeleteFolderTransactionScript,
    BulkReparentFoldersTransactionScript,
    ReorderFoldersTransactionScript,
  ],
  controllers: [
    BulkReparentAction,
    ReorderFoldersAction,
    CreateFolderAction,
    GetFoldersByUserAction,
    UpdateFolderAction,
    DeleteFolderAction,
  ],
})
export class FoldersModule {}
