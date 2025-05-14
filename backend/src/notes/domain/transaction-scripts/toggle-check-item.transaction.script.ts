import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CheckItem } from "../entities/notes/check-item.entity";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class ToggleCheckItemTransactionScript {
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>
  ) {}

  async apply(id: number, authUser: AuthUser): Promise<CheckItem> {
    const checkItem = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .leftJoinAndSelect('checkItem.note', 'note')
      .where('checkItem.id = :id', { id })
      .andWhere('note.userId = :userId', { userId: authUser.userId })
      .getOne();

    if (!checkItem) {
      throw new NotFoundException("Check item not found");
    }

    // Toggle the done_date - if it's null, set it to now, if it exists, set it to null
    checkItem.doneDate = checkItem.doneDate ? null : new Date();
    
    return this.checkItemRepository.save(checkItem);
  }
} 