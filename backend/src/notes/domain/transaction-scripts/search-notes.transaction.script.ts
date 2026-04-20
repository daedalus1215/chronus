import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

export type NoteSearchMatches = {
  noteNameMatches: { noteId: number; noteName: string; isMemo: boolean }[];
  memoMatches: { noteId: number; noteName: string; description: string }[];
};

@Injectable()
export class SearchNotesTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(userId: number, query: string): Promise<NoteSearchMatches> {
    const [noteNameMatches, memoMatches] = await Promise.all([
      this.noteRepository.searchNoteNames(userId, query),
      this.noteRepository.searchMemoDescriptions(userId, query),
    ]);

    return { noteNameMatches, memoMatches };
  }
}
