import { Injectable, NotFoundException } from "@nestjs/common";
import { CheckItem } from "../../entities/check-item.entity";
import { CheckItemsRepository } from "../../../infra/repositories/check-items.repository";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class GetCheckItemTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(id: number, authUser: AuthUser): Promise<CheckItem> {
    const checkItem = await this.checkItemsRepository.findByIdWithNoteValidation(id, authUser.userId);

    if (!checkItem) {
      throw new NotFoundException("Check item not found");
    }

    return checkItem;
  }
}
