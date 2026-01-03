import { Injectable } from "@nestjs/common";
import { CheckItemsRepository } from "../../infra/repositories/check-items/check-items.repository";
import { GetCheckItemsByNoteTransactionScript } from "../transaction-scripts/get-check-items-by-note/get-check-items-by-note.transaction.script";

export type CheckItemProjection = {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class CheckItemsAggregator {
  constructor(
    private readonly checkItemsRepository: CheckItemsRepository,
    private readonly getCheckItemsByNoteTransactionScript: GetCheckItemsByNoteTransactionScript,
  ) {}

  async deleteCheckItemsByNoteId(noteId: number): Promise<void> {
    return this.checkItemsRepository.deleteByNoteId(noteId);
  }

  async findByNoteId(noteId: number, userId: number): Promise<CheckItemProjection[]> {
    // Use repository directly to validate note access but allow empty results
    // (notes can exist without check items)
    const checkItems = await this.checkItemsRepository.findByNoteIdWithUserValidation(noteId, userId);
    
    // Sort: non-archived first, then archived
    const nonArchivedCheckItems = checkItems.filter(item => item.doneDate == null);
    const archivedCheckItems = checkItems.filter(item => item.doneDate !== null);
    const sortedCheckItems = [...nonArchivedCheckItems, ...archivedCheckItems];
    
    return sortedCheckItems.map((item) => ({
      id: item.id,
      name: item.name,
      doneDate: item.doneDate,
      archiveDate: item.archiveDate,
      noteId: item.noteId,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
}