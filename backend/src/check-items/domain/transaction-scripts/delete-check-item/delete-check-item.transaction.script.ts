import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { CheckItem } from '../../entities/check-item.entity';

@Injectable()
export class DeleteCheckItemTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(id: number, noteId: number, authUser: AuthUser): Promise<void> {
    const checkItem = await this.checkItemsRepository.findByIdWithNoteValidationForUpdate(id, noteId, authUser.userId);

    if (!checkItem) {
      throw new NotFoundException('Check item not found');
    }

    await this.checkItemsRepository.delete(id);
  }
}