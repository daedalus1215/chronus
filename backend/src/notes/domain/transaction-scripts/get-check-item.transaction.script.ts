import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CheckItem } from "../entities/notes/check-item.entity";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class GetCheckItemTransactionScript {
  constructor(
    @InjectRepository(CheckItem)
    private readonly checkItemRepository: Repository<CheckItem>
  ) {}

  async apply(id: number, authUser: AuthUser): Promise<CheckItem> {
    //@TODO: Move this into a repository
    const checkItem = await this.checkItemRepository
      .createQueryBuilder('checkItem')
      .leftJoinAndSelect('checkItem.note', 'note')
      .where('checkItem.id = :id', { id })
      .andWhere('note.userId = :userId', { userId: authUser.userId })
      .andWhere('checkItem.archived_date IS NULL')
      .getOne();

    if (!checkItem) {
      throw new NotFoundException("Check item not found");
    }

    return checkItem;
  }
} 