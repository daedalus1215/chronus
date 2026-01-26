import { Injectable } from '@nestjs/common';
import { GetTagsByNoteIdsTransactionScript } from '../transaction-scripts/get-tags-by-note-ids.transaction.script';

@Injectable()
export class TagAggregator {
  constructor(
    private readonly getTagsByNoteIdsTS: GetTagsByNoteIdsTransactionScript
  ) {}

  async getTagsByNoteIds(
    noteIds: number[]
  ): Promise<Map<number, Array<{ id: number; name: string }>>> {
    const tagsMap = await this.getTagsByNoteIdsTS.apply(noteIds);
    return new Map(
      Array.from(tagsMap).map(([noteId, tags]) => [
        noteId,
        tags.map(tag => ({ id: tag.id, name: tag.name })),
      ])
    );
  }
}
