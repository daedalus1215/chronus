import { Injectable } from "@nestjs/common";
import { CheckItem } from "../entities/check-item.entity";
import { CreateCheckItemTransactionScript } from "../transaction-scripts/create-check-item/create-check-item.transaction.script";
import { GetCheckItemTransactionScript } from "../transaction-scripts/get-check-item/get-check-item.transaction.script";
import { ToggleCheckItemTransactionScript } from "../transaction-scripts/toggle-check-item/toggle-check-item.transaction.script";
import { DeleteCheckItemTransactionScript } from "../transaction-scripts/delete-check-item/delete-check-item.transaction.script";
import { UpdateCheckItemTransactionScript } from "../transaction-scripts/update-check-item/update-check-item.transaction.script";
import { GetCheckItemsByNoteTransactionScript } from "../transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CreateCheckItemDto } from "../../apps/dtos/requests/create-check-item.dto";
import { UpdateCheckItemDto } from "../../apps/dtos/requests/update-check-item.dto";
import { NoteAggregator } from "src/notes/domain/aggregators/note.aggregator";

@Injectable()
export class CheckItemService {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript,
    private readonly getCheckItemTransactionScript: GetCheckItemTransactionScript,
    private readonly toggleCheckItemTransactionScript: ToggleCheckItemTransactionScript,
    private readonly deleteCheckItemTransactionScript: DeleteCheckItemTransactionScript,
    private readonly updateCheckItemTransactionScript: UpdateCheckItemTransactionScript,
    private readonly getCheckItemsByNoteTransactionScript: GetCheckItemsByNoteTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async createCheckItem(dto: {authUser: AuthUser, checkItem: CreateCheckItemDto, noteId: number}): Promise<CheckItem[]> {
    const note = await this.noteAggregator.getReference(dto.noteId, dto.authUser.userId);

    return this.createCheckItemTransactionScript.apply({
      name: dto.checkItem.name,
      noteId: note.id,
      userId: dto.authUser.userId,
    });
  }
  
  async getCheckItem(id: number, authUser: AuthUser): Promise<CheckItem> {
    return await this.getCheckItemTransactionScript.apply(id, authUser);
  }

  async toggleCheckItem(id: number, noteId: number, authUser: AuthUser): Promise<CheckItem> {
    return await this.toggleCheckItemTransactionScript.apply(id, noteId, authUser);
  }

  async deleteCheckItem(id: number, noteId: number, authUser: AuthUser): Promise<void> {
    return await this.deleteCheckItemTransactionScript.apply(id, noteId, authUser);
  }

  async updateCheckItem(id: number, noteId: number, dto: UpdateCheckItemDto, authUser: AuthUser): Promise<CheckItem> {
    return await this.updateCheckItemTransactionScript.apply(id, noteId, dto, authUser);
  }

  async getCheckItemsByNoteId(noteId: number, authUser: AuthUser): Promise<CheckItem[]> {
    return await this.getCheckItemsByNoteTransactionScript.apply(noteId, authUser.userId);
  }
} 