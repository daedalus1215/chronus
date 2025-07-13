import { Injectable } from "@nestjs/common";
import { CheckItem } from "../../entities/check-item.entity";
import { CreateCheckItemDto } from "../../../apps/dtos/requests/create-check-item.dto";
import { CheckItemsRepository } from "../../../infra/repositories/check-items/check-items.repository";

@Injectable()
export class CreateCheckItemTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository,
  ) {}

  async apply(
    dto: CreateCheckItemDto & {
      noteId: number;
      userId: number;
    }
  ): Promise<CheckItem[]> {
    const checkItems = await this.saveCheckItem(dto);

    const nonArchivedCheckItemsFilter = (item: CheckItem) =>
      item.doneDate == null;
    const archivedCheckItemsFilter = (item: CheckItem) =>
      item.doneDate !== null;

    return [
      ...this.sortCheckItemsByArchiveStatus(
        checkItems,
        nonArchivedCheckItemsFilter
      ),
      ...this.sortCheckItemsByArchiveStatus(
        checkItems,
        archivedCheckItemsFilter
      ),
    ];
  }

  private async saveCheckItem({
    name,
    noteId,
    userId,
  }: CreateCheckItemDto & { noteId: number, userId: number }): Promise<CheckItem[]> {
    const newCheckItem = new CheckItem();
    newCheckItem.name = name;
    newCheckItem.noteId = noteId;
    await this.checkItemsRepository.save(newCheckItem);
    return this.checkItemsRepository.findByNoteId(noteId);
  }

  private sortCheckItemsByArchiveStatus(
    checkItems: CheckItem[],
    doneComparison: (item: CheckItem) => boolean
  ): CheckItem[] {
    return checkItems
      .filter(doneComparison)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
} 