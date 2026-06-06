import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteWriterPort } from '../../../note-transfer/domain/ports/note-writer.port';
import { Note } from '../../domain/entities/notes/note.entity';
import { Memo } from '../../domain/entities/notes/memo.entity';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

/**
 * Adapter that implements NoteWriterPort using notes repositories.
 */
@Injectable()
export class NoteWriterAdapter implements NoteWriterPort {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
    @InjectRepository(Note)
    private readonly rawNoteRepository: Repository<Note>
  ) {}

  async createNoteWithMemo(
    name: string,
    description: string | undefined,
    userId: number
  ): Promise<number> {
    const note = new Note();
    note.name = name;
    note.userId = userId;

    // Always create a memo for imported notes
    const memo = new Memo();
    memo.description = description ?? '';
    const savedMemo = await this.memoRepository.save(memo);
    note.memo = savedMemo;

    const savedNote = await this.noteRepository.save(note);
    return savedNote.id;
  }

  async replaceDescription(
    noteId: number,
    description: string
  ): Promise<void> {
    // Find the note
    const note = await this.rawNoteRepository.findOne({
      where: { id: noteId },
      relations: ['memo'],
    });

    if (!note) {
      throw new Error('Note not found');
    }

    if (note.memo) {
      // Update existing memo
      note.memo.description = description;
      await this.memoRepository.save(note.memo);
    } else {
      // Create a new memo for the note
      const memo = new Memo();
      memo.description = description;
      const savedMemo = await this.memoRepository.save(memo);
      note.memo = savedMemo;
      await this.rawNoteRepository.save(note);
    }
  }
}