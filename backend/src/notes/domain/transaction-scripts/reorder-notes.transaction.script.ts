import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Note } from '../entities/notes/note.entity';

export type ReorderNotesInput = {
  userId: number;
  items: { id: number; sortOrder: number }[];
  folderId: number | null;
};

@Injectable()
export class ReorderNotesTransactionScript {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async apply(input: ReorderNotesInput): Promise<void> {
    const { userId, items, folderId } = input;

    if (items.length === 0) return;

    await this.dataSource.transaction(async em => {
      const repo = em.getRepository(Note);

      for (const item of items) {
        const note = await repo.findOne({ where: { id: item.id, userId } });
        if (!note) {
          throw new BadRequestException(`Note ${item.id} not found`);
        }
        const noteFolder = note.folderId ?? null;
        if (noteFolder !== folderId) {
          throw new BadRequestException(
            `Note ${item.id} does not belong to the specified folder`
          );
        }
        note.sortOrder = item.sortOrder;
        await repo.save(note);
      }
    });
  }
}
