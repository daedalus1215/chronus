import { Injectable, ForbiddenException } from '@nestjs/common';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';

@Injectable()
export class GetCheckItemsByNoteTransactionScript {
  constructor(private readonly checkItemsRepository: CheckItemsRepository) {}

  async apply(noteId: number, userId: number): Promise<CheckItem[]> {
    const checkItems =
      await this.checkItemsRepository.findByNoteIdWithUserValidation(
        noteId,
        userId
      );

    if (checkItems.length === 0) {
      throw new ForbiddenException('Access denied to this note');
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
