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
    const checkItemsResults = await Promise.all(
      dto.checkItemIds.map(id => 
        this.checkItemsRepository.findByIdWithNoteValidationForUpdate(id, noteId, userId)
      )
    );

    const hasNullItems = checkItemsResults.some(item => item === null);
    if (hasNullItems) {
      throw new NotFoundException('One or more check items not found or access denied');
    }

    const hasInvalidNoteId = checkItemsResults.some(item => item!.noteId !== noteId);
    
    if (hasInvalidNoteId) {
      throw new ForbiddenException('All check items must belong to the same note');
    }

    const updatePromises = checkItemsResults.map((item, index) => {
      const updatedItem = { ...item, order: index };
      return this.checkItemsRepository.save(updatedItem);
    });

    await Promise.all(updatePromises);

    return this.checkItemsRepository.findByNoteIdWithUserValidation(noteId, userId);
  }
}

