import { Injectable } from '@nestjs/common';
import { CheckItemWriterPort } from '../../../note-transfer/domain/ports/check-item-writer.port';
import { CheckItemsRepository } from '../../infra/repositories/check-items/check-items.repository';
import { CheckItem } from '../../domain/entities/check-item.entity';

/**
 * Adapter that implements CheckItemWriterPort using CheckItemsRepository.
 */
@Injectable()
export class CheckItemWriterAdapter implements CheckItemWriterPort {
  constructor(private readonly checkItemsRepository: CheckItemsRepository) {}

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
