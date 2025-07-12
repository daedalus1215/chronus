import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CheckItem } from "../entities/notes/check-item.entity";
import { CreateCheckItemTransactionScript } from "../transaction-scripts/create-check-item.transaction.script";
import { NoteAggregator } from "../aggregators/note.aggregator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class CheckItemService {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async createCheckItem(authUser: AuthUser, checkItem: CheckItem): Promise<CheckItem[]> {
    const note = await this.noteAggregator.getReference(checkItem.note.id, authUser.userId);

    return this.createCheckItemTransactionScript.apply({
      name: checkItem.name,
      noteId: note.id,
      authUser
    });
  }

}   