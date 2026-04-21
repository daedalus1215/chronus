import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from '../../domain/entities/notes/note.entity';
import { NoteFolderPort } from 'src/folders/domain/ports/note-folder.port';

@Injectable()
export class NoteFolderAdapter implements NoteFolderPort {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>
  ) {}

  async nullifyFolderIds(folderIds: number[]): Promise<void> {
    if (folderIds.length === 0) return;
    await this.noteRepository.update(
      { folderId: In(folderIds) },
      { folderId: null }
    );
  }
}
