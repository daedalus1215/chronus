import { Injectable } from '@nestjs/common';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckItemsRepository, FindByNoteIdFilters } from '../../../infra/repositories/check-items/check-items.repository';

export type GetCheckItemsByNoteFilters = FindByNoteIdFilters;

@Injectable()
export class GetCheckItemsByNoteTransactionScript {
  constructor(private readonly checkItemsRepository: CheckItemsRepository) {}

  async apply(
    noteId: number,
    userId: number,
    filters?: GetCheckItemsByNoteFilters
  ): Promise<CheckItem[]> {
    const checkItems =
      await this.checkItemsRepository.findByNoteIdWithUserValidation(
        noteId,
        userId,
        filters
      );

    if (checkItems.length === 0) {
      return [];
    }

    const nonArchivedCheckItems = checkItems.filter(
      item => item.doneDate == null
    );
    const archivedCheckItems = checkItems.filter(
      item => item.doneDate !== null
    );

    return [...nonArchivedCheckItems, ...archivedCheckItems];
  }
}
