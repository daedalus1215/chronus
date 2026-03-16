import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Note } from '../../entities/notes/note.entity';
import { Memo } from '../../entities/notes/memo.entity';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';

@Injectable()
export class ConvertChecklistToMemoTransactionScript {
  constructor(private readonly noteMemoTagRepository: NoteMemoTagRepository) {}

  async apply(noteId: number, userId: number): Promise<Note> {
    const note = await this.noteMemoTagRepository.findById(noteId, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.memo !== null) {
      throw new BadRequestException('Note is already a memo');
    }

    const newMemo = new Memo();
    newMemo.description = '';
    const savedNote = {
      ...note,
      memo: newMemo,
    };
    return await this.noteMemoTagRepository.save(savedNote);
  }
}
