import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './domain/entities/folder.entity';
import { FolderRepository } from './infra/repositories/folder.repository';
import { CreateFolderTransactionScript } from './domain/transaction-scripts/create-folder.transaction-script';
import { GetFoldersByUserTransactionScript } from './domain/transaction-scripts/get-folders-by-user.transaction-script';
import { UpdateFolderTransactionScript } from './domain/transaction-scripts/update-folder.transaction-script';
import { DeleteFolderTransactionScript } from './domain/transaction-scripts/delete-folder.transaction-script';
import { CreateFolderAction } from './app/actions/create-folder-action/create-folder.action';
import { GetFoldersByUserAction } from './app/actions/get-folders-by-user-action/get-folders-by-user.action';
import { UpdateFolderAction } from './app/actions/update-folder-action/update-folder.action';
import { DeleteFolderAction } from './app/actions/delete-folder-action/delete-folder.action';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), NotesModule],
  providers: [
    FolderRepository,
    CreateFolderTransactionScript,
    GetFoldersByUserTransactionScript,
    UpdateFolderTransactionScript,
    DeleteFolderTransactionScript,
  ],
  controllers: [
    CreateFolderAction,
    GetFoldersByUserAction,
    UpdateFolderAction,
    DeleteFolderAction,
  ],
})
export class FoldersModule {}
