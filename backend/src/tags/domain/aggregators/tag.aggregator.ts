import { Injectable } from '@nestjs/common';
import { GetTagsByNoteIdsTransactionScript } from '../transaction-scripts/get-tags-by-note-ids.transaction.script';

@Injectable()
export class TagAggregator {
  constructor(
    private readonly getTagsByNoteIdsTS: GetTagsByNoteIdsTransactionScript
  ) {}

  async getTagsByNoteIds(
    noteIds: number[]
  ): Promise<Map<number, { id: number; name: string }[]>> {
    return new Map(
      Array.from(await this.getTagsByNoteIdsTS.apply(noteIds)).map(([noteId, tags]) => [
        noteId,
        tags.map(tag => ({ id: tag.id, name: tag.name })),
      ])
    );
  }
}
