import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';
import { ReorderCheckItemsDto } from '../../../apps/dtos/requests/reorder-check-items.dto';

@Injectable()
export class ReorderCheckItemsTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(
    noteId: number,
    userId: number,
    dto: ReorderCheckItemsDto
  ): Promise<CheckItem[]> {
    // Fetch all check items that match the provided IDs and validate they belong to the note and user
    const checkItemsResults = await Promise.all(
      dto.checkItemIds.map(id => 
        this.checkItemsRepository.findByIdWithNoteValidationForUpdate(id, noteId, userId)
      )
    );

    // Check if all items were found and belong to the user
    const checkItems: CheckItem[] = [];
    for (const item of checkItemsResults) {
      if (item === null) {
        throw new NotFoundException('One or more check items not found or access denied');
      }
      if (item.noteId !== noteId) {
        throw new ForbiddenException('All check items must belong to the same note');
      }
      checkItems.push(item);
    }

    // Update order for each item based on its position in the array
    const updatePromises = checkItems.map((item, index) => {
      item.order = index;
      return this.checkItemsRepository.save(item);
    });

    await Promise.all(updatePromises);

    // Return all check items for the note in the new order
    return this.checkItemsRepository.findByNoteIdWithUserValidation(noteId, userId);
  }
}

