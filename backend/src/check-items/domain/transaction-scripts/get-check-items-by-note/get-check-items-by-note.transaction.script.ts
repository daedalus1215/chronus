import { Injectable, ForbiddenException } from "@nestjs/common";
import { CheckItem } from "../../entities/check-item.entity";
import { CheckItemsRepository } from "../../../infra/repositories/check-items/check-items.repository";

@Injectable()
export class GetCheckItemsByNoteTransactionScript {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository
  ) {}

  async apply(noteId: number, userId: number): Promise<CheckItem[]> {
    const checkItems = await this.checkItemsRepository.findByNoteIdWithUserValidation(noteId, userId);

    if (checkItems.length === 0) {
      // This could mean either no check items exist, or the user doesn't have access
      // You might want to verify note access separately
      throw new ForbiddenException('Access denied to this note');
    }

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