import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckItem } from '../entities/check-item.entity';
import { CreateCheckItemTransactionScript } from '../transaction-scripts/create-check-item/create-check-item.transaction.script';
import { GetCheckItemTransactionScript } from '../transaction-scripts/get-check-item/get-check-item.transaction.script';
import { ToggleCheckItemTransactionScript } from '../transaction-scripts/toggle-check-item/toggle-check-item.transaction.script';
import { DeleteCheckItemTransactionScript } from '../transaction-scripts/delete-check-item/delete-check-item.transaction.script';
import { UpdateCheckItemTransactionScript } from '../transaction-scripts/update-check-item/update-check-item.transaction.script';
import { GetCheckItemsByNoteTransactionScript } from '../transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script';
import { ReorderCheckItemsTransactionScript } from '../transaction-scripts/reorder-check-items/reorder-check-items.transaction.script';
import { UpdateCheckItemStatusTransactionScript } from '../transaction-scripts/update-check-item-status/update-check-item-status.transaction.script';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CreateCheckItemDto } from '../../apps/dtos/requests/create-check-item.dto';
import { UpdateCheckItemDto } from '../../apps/dtos/requests/update-check-item.dto';
import { UpdateCheckItemStatusDto } from '../../apps/dtos/requests/update-check-item-status.dto';
import { ReorderCheckItemsDto } from '../../apps/dtos/requests/reorder-check-items.dto';
import { VERIFY_NOTE_ACCESS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/verify-note-access.command';

@Injectable()
export class CheckItemService {
  constructor(
    private readonly createCheckItemTransactionScript: CreateCheckItemTransactionScript,
    private readonly getCheckItemTransactionScript: GetCheckItemTransactionScript,
    private readonly toggleCheckItemTransactionScript: ToggleCheckItemTransactionScript,
    private readonly deleteCheckItemTransactionScript: DeleteCheckItemTransactionScript,
    private readonly updateCheckItemTransactionScript: UpdateCheckItemTransactionScript,
    private readonly updateCheckItemStatusTransactionScript: UpdateCheckItemStatusTransactionScript,
    private readonly getCheckItemsByNoteTransactionScript: GetCheckItemsByNoteTransactionScript,
    private readonly reorderCheckItemsTransactionScript: ReorderCheckItemsTransactionScript,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createCheckItem(dto: {
    authUser: AuthUser;
    checkItem: CreateCheckItemDto;
    noteId: number;
  }): Promise<CheckItem[]> {
    await this.eventEmitter.emitAsync(VERIFY_NOTE_ACCESS_COMMAND, {
      noteId: dto.noteId,
      userId: dto.authUser.userId,
    });

    return this.createCheckItemTransactionScript.apply({
      name: dto.checkItem.name,
      noteId: dto.noteId,
    });
  }

  async getCheckItem(id: number, authUser: AuthUser): Promise<CheckItem> {
    return await this.getCheckItemTransactionScript.apply(id, authUser);
  }

  async toggleCheckItem(
    id: number,
    noteId: number,
    authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.toggleCheckItemTransactionScript.apply(
      id,
      noteId,
      authUser
    );
  }

  async deleteCheckItem(
    id: number,
    noteId: number,
    authUser: AuthUser
  ): Promise<void> {
    return await this.deleteCheckItemTransactionScript.apply(
      id,
      noteId,
      authUser
    );
  }

  async updateCheckItem(
    id: number,
    noteId: number,
    dto: UpdateCheckItemDto,
    authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.updateCheckItemTransactionScript.apply(
      id,
      noteId,
      dto,
      authUser
    );
  }

  async updateCheckItemStatus(
    id: number,
    dto: UpdateCheckItemStatusDto,
    authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.updateCheckItemStatusTransactionScript.apply(
      id,
      dto,
      authUser
    );
  }

  async getCheckItemsByNoteId(
    noteId: number,
    authUser: AuthUser
  ): Promise<CheckItem[]> {
    return await this.getCheckItemsByNoteTransactionScript.apply(
      noteId,
      authUser.userId
    );
  }

  async reorderCheckItems(
    noteId: number,
    authUser: AuthUser,
    dto: ReorderCheckItemsDto
  ): Promise<CheckItem[]> {
    return await this.reorderCheckItemsTransactionScript.apply(
      noteId,
      authUser.userId,
      dto
    );
  }
}
