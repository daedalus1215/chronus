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
    }
  ): Promise<CheckItem[]> {
    const checkItems = await this.saveCheckItem(dto);

    // Items are already ordered by 'order' column from the repository
    // Separate archived (done) and non-archived items, maintaining order within each group
    const nonArchivedCheckItems = checkItems.filter(item => item.doneDate == null);
    const archivedCheckItems = checkItems.filter(item => item.doneDate !== null);

    return [...nonArchivedCheckItems, ...archivedCheckItems];
  }

  private async saveCheckItem({
    name,
    noteId,
  }: CreateCheckItemDto & { noteId: number }): Promise<CheckItem[]> {
    const maxOrder = await this.checkItemsRepository.getMaxOrderByNoteId(noteId);
    const newCheckItem = new CheckItem();
    newCheckItem.name = name;
    newCheckItem.noteId = noteId;
    newCheckItem.order = maxOrder + 1;
    await this.checkItemsRepository.save(newCheckItem);
    return this.checkItemsRepository.findByNoteId(noteId);
  }
} 