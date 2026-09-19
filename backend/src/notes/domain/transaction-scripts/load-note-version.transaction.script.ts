import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteVersionRepository } from '../../infra/repositories/note-version.repository';
import { NoteVersion } from '../entities/notes/note-version.entity';

@Injectable()
export class LoadNoteVersionTransactionScript {
  constructor(private readonly noteVersionRepository: NoteVersionRepository) {}

  async apply(
    noteId: number,
    versionId: number,
    userId: number
  ): Promise<NoteVersion> {
    const version = await this.noteVersionRepository.findById(
      versionId,
      noteId,
      userId
    );
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    return version;
  }
}
