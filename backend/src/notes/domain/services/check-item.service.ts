import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CheckItem } from "../entities/notes/check-item.entity";
import { CreateCheckItemTransactionScript } from "../transaction-scripts/create-check-item-ts/create-check-item.transaction.script";
import { NoteAggregator } from "../aggregators/note.aggregator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CreateCheckItemDto } from "src/notes/apps/dtos/requests/create-check-item.dto";

@Injectable()
export class CheckItemService {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async createCheckItem(dto: {authUser: AuthUser, checkItem: CreateCheckItemDto, noteId: number}): Promise<CheckItem[]> {
    const note = await this.noteAggregator.getReference(dto.noteId, dto.authUser.userId);

    return this.createCheckItemTransactionScript.apply({
      name: dto.checkItem.name,
      noteId: note.id,
    });
  }

}   