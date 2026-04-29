import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Folder } from '../entities/folder.entity';

export type ReorderFoldersInput = {
  userId: number;
  items: { id: number; sortOrder: number }[];
  parentId: number | null;
};

@Injectable()
export class ReorderFoldersTransactionScript {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async apply(input: ReorderFoldersInput): Promise<void> {
    const { userId, items, parentId } = input;

    if (items.length === 0) return;

    await this.dataSource.transaction(async em => {
      const repo = em.getRepository(Folder);

      for (const item of items) {
        const folder = await repo.findOne({ where: { id: item.id, userId } });
        if (!folder) {
          throw new BadRequestException(`Folder ${item.id} not found`);
        }
        const folderParent = folder.parentId ?? null;
        if (folderParent !== parentId) {
          throw new BadRequestException(
            `Folder ${item.id} does not belong to the specified parent`
          );
        }
        folder.sortOrder = item.sortOrder;
        await repo.save(folder);
      }
    });
  }
}
