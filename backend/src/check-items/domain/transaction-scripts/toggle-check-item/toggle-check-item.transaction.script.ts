import { Injectable, NotFoundException } from "@nestjs/common";
import { CheckItem } from "../../entities/check-item.entity";
import { CheckItemsRepository } from "../../../infra/repositories/check-items.repository";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class ToggleCheckItemTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(id: number, authUser: AuthUser): Promise<CheckItem> {
    const checkItem = await this.checkItemsRepository.findByIdWithNoteValidationForUpdate(id, authUser.userId);

    if (!checkItem) {
      throw new NotFoundException("Check item not found");
    }

    // Toggle the done_date - if it's null, set it to now, if it exists, set it to null
    checkItem.doneDate = checkItem.doneDate ? null : new Date();
    
    return this.checkItemsRepository.save(checkItem);
  }
}
