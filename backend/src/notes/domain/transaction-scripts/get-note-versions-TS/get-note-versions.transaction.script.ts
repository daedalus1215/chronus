import { Injectable } from '@nestjs/common';
import { NoteVersionRepository } from '../../../infra/repositories/note-version.repository';
import { NoteVersion } from '../../entities/notes/note-version.entity';

@Injectable()
export class GetNoteVersionsTransactionScript {
  constructor(private readonly noteVersionRepository: NoteVersionRepository) {}

  async apply(noteId: number, userId: number): Promise<NoteVersion[]> {
    return this.noteVersionRepository.findByNoteId(noteId, userId);
  }
}
