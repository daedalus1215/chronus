import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { NoteNameRow } from './note-name-row.projection';

@Injectable()
export class GetNoteNamesForExplorerTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(userId: number, folderId?: string): Promise<NoteNameRow[]> {
    return this.noteRepository.getNoteNamesForExplorer(userId, folderId);
  }
}
