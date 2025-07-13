import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckItem } from '../../entities/check-item.entity';
import { CheckItemsRepository } from '../../../infra/repositories/check-items/check-items.repository';
import { UpdateCheckItemDto } from '../../../apps/dtos/requests/update-check-item.dto';
import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

@Injectable()
export class UpdateCheckItemTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(id: number, noteId: number, dto: UpdateCheckItemDto, authUser: AuthUser): Promise<CheckItem> {
    const checkItem = await this.checkItemsRepository.findByIdWithNoteValidationForUpdate(id, noteId, authUser.userId);

    if (!checkItem) {
      throw new NotFoundException('Check item not found');
    }

    checkItem.name = dto.name;
    return this.checkItemsRepository.save(checkItem);
  }
} 