import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FolderRepository } from '../../infra/repositories/folder.repository';
import { Folder } from '../entities/folder.entity';

export type BulkReparentFoldersInput = {
  userId: number;
  folderIds: number[];
  parentId: number | null;
};

@Injectable()
export class BulkReparentFoldersTransactionScript {
  constructor(
    private readonly folderRepository: FolderRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async apply(input: BulkReparentFoldersInput): Promise<Folder[]> {
    const { userId, parentId } = input;
    const folderIds = [...new Set(input.folderIds)];

    if (folderIds.length < 2) {
      throw new BadRequestException('At least two folder IDs are required');
    }

    const allFolders = await this.folderRepository.findAllByUserId(userId);
    const byId = new Map(allFolders.map(f => [f.id, f]));

    for (const id of folderIds) {
      if (!byId.has(id)) {
        throw new BadRequestException(`Folder ${id} not found`);
      }
    }

    if (parentId !== null) {
      if (!byId.has(parentId)) {
        throw new BadRequestException('Destination folder not found');
      }
      if (folderIds.includes(parentId)) {
        throw new BadRequestException(
          'Cannot move selected folders into a folder that is also being moved'
        );
      }
    }

    const effectiveIds = folderIds.filter(
      id =>
        !folderIds.some(
          other => other !== id && this.isProperAncestor(other, id, byId)
        )
    );

    for (const id of effectiveIds) {
      if (parentId === null) continue;
      const subtree = this.collectSubtree(id, allFolders);
      if (subtree.has(parentId)) {
        const name = byId.get(id)?.name ?? String(id);
        throw new BadRequestException(
          `Cannot move folder "${name}" into its own descendant`
        );
      }
    }

    return this.dataSource.transaction(async em => {
      const repo = em.getRepository(Folder);
      const out: Folder[] = [];
      for (const id of effectiveIds) {
        const folder = await repo.findOne({ where: { id, userId } });
        if (!folder) {
          throw new BadRequestException(`Folder ${id} not found`);
        }
        folder.parentId = parentId;
        out.push(await repo.save(folder));
      }
      return out;
    });
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

  private isProperAncestor(
    ancestorId: number,
    descendantId: number,
    byId: Map<number, Folder>
  ): boolean {
    let current = byId.get(descendantId)?.parentId ?? null;
    while (current !== null) {
      if (current === ancestorId) return true;
      current = byId.get(current)?.parentId ?? null;
    }
    return false;
  }
}
