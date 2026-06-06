import { Injectable } from '@nestjs/common';
import { GetTagsByNoteIdsTransactionScript } from '../transaction-scripts/get-tags-by-note-ids.transaction.script';
import { GetTagsByNoteIdTransactionScript } from '../transaction-scripts/get-tags-by-note-id.transaction.script';

@Injectable()
export class TagAggregator {
  constructor(
    private readonly getTagsByNoteIdsTS: GetTagsByNoteIdsTransactionScript,
    private readonly getTagsByNoteIdTS: GetTagsByNoteIdTransactionScript
  ) {}

  async getTagsByNoteIds(
    noteIds: number[]
  ): Promise<Map<number, { id: number; name: string }[]>> {
    return new Map(
      Array.from(await this.getTagsByNoteIdsTS.apply(noteIds)).map(
        ([noteId, tags]) => [
          noteId,
          tags.map(tag => ({ id: tag.id, name: tag.name })),
        ]
      )
    );
  }

  async getTagNamesByNoteId(noteId: number): Promise<string[]> {
    const tags = await this.getTagsByNoteIdTS.apply(noteId);
    return tags.map(tag => tag.name);
  }
}
