import { Injectable } from '@nestjs/common';
import { CheckItemsRepository } from '../../infra/repositories/check-items/check-items.repository';
import { GetCheckItemsByNoteTransactionScript } from '../transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script';
import { CheckItemWriterPort } from '../../../note-transfer/domain/ports/check-item-writer.port';
import { CheckItem } from '../entities/check-item.entity';

export type CheckItemProjection = {
  id: number;
  name: string;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  order: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CheckItemsAggregator implements CheckItemWriterPort {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository,
    private readonly getCheckItemsByNoteTransactionScript: GetCheckItemsByNoteTransactionScript
  ) {}

  async searchByQuery(
    userId: number,
    query: string,
    options?: { includeArchived?: boolean }
  ): Promise<Array<{
    noteId: number;
    noteName: string;
    checkItemId: number;
    checkItemName: string;
    checkItemStatus: 'ready' | 'in_progress' | 'review' | 'done';
    checkItemDescription: string | null;
    checkItemIsArchived: boolean;
  }>> {
    return this.checkItemsRepository.searchByQuery(userId, query, options);
  }

  async deleteCheckItemsByNoteId(noteId: number): Promise<void> {
    return this.checkItemsRepository.deleteByNoteId(noteId);
  }

  async findByNoteId(
    noteId: number,
    userId: number
  ): Promise<CheckItemProjection[]> {
    // Use repository directly to validate note access but allow empty results
    // (notes can exist without check items)
    const checkItems =
      await this.checkItemsRepository.findByNoteIdWithUserValidation(
        noteId,
        userId
      );

    // Sort: non-archived first, then archived
    const nonArchivedCheckItems = checkItems.filter(
      item => item.doneDate == null
    );
    const archivedCheckItems = checkItems.filter(
      item => item.doneDate !== null
    );
    const sortedCheckItems = [...nonArchivedCheckItems, ...archivedCheckItems];

    return sortedCheckItems.map(item => ({
      id: item.id,
      name: item.name,
      status: item.status,
      doneDate: item.doneDate,
      archiveDate: item.archiveDate,
      noteId: item.noteId,
      order: item.order,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  // CheckItemWriterPort implementation
  async bulkCreate(
    noteId: number,
    items: Array<{
      name: string;
      description: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate: Date | null;
      archiveDate: Date | null;
    }>
  ): Promise<void> {
    // Get the current max order to rebase incoming items
    const currentItems = await this.checkItemsRepository.findByNoteId(noteId);
    const maxOrder = currentItems.reduce(
      (max, item) => Math.max(max, item.order),
      -1
    );

    // Create all check items with rebased order
    const checkItems = items.map((item, index) => {
      const checkItem = new CheckItem();
      checkItem.name = item.name;
      checkItem.description = item.description;
      checkItem.noteId = noteId;
      checkItem.order = maxOrder + 1 + index;
      checkItem.status = item.status;
      checkItem.doneDate = item.doneDate;
      checkItem.archiveDate = item.archiveDate;
      return checkItem;
    });

    await this.checkItemsRepository.saveMany(checkItems);
  }
}
