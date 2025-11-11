import { Injectable } from "@nestjs/common";
import { CheckItemsRepository } from "../../infra/repositories/check-items/check-items.repository";

@Injectable()
export class CheckItemsAggregator {
  constructor(private readonly checkItemsRepository: CheckItemsRepository) {}

  async deleteCheckItemsByNoteId(noteId: number): Promise<void> {
    return this.checkItemsRepository.deleteByNoteId(noteId);
  }
}