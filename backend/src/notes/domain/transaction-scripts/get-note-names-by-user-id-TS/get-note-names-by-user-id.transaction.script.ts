import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { NoteNameRow } from '../note-name-row.projection';

export type GetNoteNamesQuery = {
  userId: number;
  cursor: number;
  limit: number;
  query?: string;
  type?: 'memo' | 'checklist';
  tagId?: string;
};

export type GetNoteNamesResult = {
  notes: NoteNameRow[];
  hasMore: boolean;
  nextCursor: number;
};

@Injectable()
export class GetNoteNamesByUserIdTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(params: GetNoteNamesQuery): Promise<GetNoteNamesResult> {
    const { userId, cursor, limit, query, type, tagId } = params;
    const notes = await this.noteRepository.getNoteNamesByUserId(
      userId,
      cursor,
      limit,
      query,
      type,
      tagId
    );
    return {
      notes,
      hasMore: notes.length === limit,
      nextCursor: cursor + limit + 1,
    };
  }
}
