import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FolderRepository } from '../../../infra/repositories/folder.repository';
import { Folder } from '../../entities/folder.entity';
import { NOTE_FOLDER_PORT, NoteFolderPort } from '../../ports/note-folder.port';

@Injectable()
export class DeleteFolderTransactionScript {
  constructor(
    private readonly folderRepository: FolderRepository,
    @Inject(NOTE_FOLDER_PORT)
    private readonly noteFolderPort: NoteFolderPort
  ) {}

  async apply(folderId: number, userId: number): Promise<void> {
    const folder = await this.folderRepository.findById(folderId, userId);
    if (!folder) throw new NotFoundException('Folder not found');

    const allFolders = await this.folderRepository.findAllByUserId(userId);
    const subtreeIds = this.collectSubtree(folderId, allFolders);

    await this.noteFolderPort.nullifyFolderIds([...subtreeIds]);

    await this.folderRepository.deleteByIds([...subtreeIds]);
  }

  private collectSubtree(rootId: number, allFolders: Folder[]): Set<number> {
    const ids = new Set<number>();
    const queue = [rootId];
    while (queue.length) {
      const current = queue.shift()!;
      ids.add(current);
      allFolders
        .filter(f => f.parentId === current)
        .forEach(f => queue.push(f.id));
    }
    return ids;
  }
}
