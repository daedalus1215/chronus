import { Injectable } from '@nestjs/common';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';
import { orderCheckItemsForDisplay } from '../order-check-items-for-display';

@Injectable()
export class GetCheckItemsByNoteTransactionScript {
  constructor(private readonly checkItemsRepository: CheckItemsRepository) {}

  async apply(noteId: number, userId: number): Promise<CheckItem[]> {
    const checkItems =
      await this.checkItemsRepository.findByNoteIdWithUserValidation(
        noteId,
        userId
      );

    return orderCheckItemsForDisplay(checkItems);
  }
}
