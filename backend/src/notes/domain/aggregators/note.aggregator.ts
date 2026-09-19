import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { Note } from '../entities/notes/note.entity';
import { Memo } from '../entities/notes/memo.entity';
import { GetNoteNamesByIdsTransactionScript } from '../transaction-scripts/get-note-names-by-ids-TS/get-note-names-by-ids.transaction.script';
import { NoteWriterPort } from '../../../note-transfer/domain/ports/note-writer.port';

type NoteReference = {
  id: number;
  name: string;
  userId: number;
};

//@TODO: all methods should be deferring to transaction scripts
@Injectable()
export class NoteAggregator implements NoteWriterPort {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly getNoteNamesByIdsTS: GetNoteNamesByIdsTransactionScript
  ) {}

  async exists(noteId: number, userId: number): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId, userId);
    return !!note;
  }

  async getMemoById(noteId: number, userId: number): Promise<Note | null> {
    const note = await this.noteRepository.findMemoById(noteId, userId);
    if (!note) {
      throw new Error('Memo not found');
    }
    return note;
  }

  async getReference(
    noteId: number,
    userId: number
  ): Promise<NoteReference | null> {
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this note');
    }

    return {
      id: note.id,
      name: note.name,
      userId: note.userId,
    };
  }

  async belongsToUser(params: {
    noteId: number;
    user: { id: number };
  }): Promise<Note> {
    //@TODO: refactor to use transaction script
    const note = await this.noteRepository.findById(
      params.noteId,
      params.user.id
    );

    if (note.userId !== params.user.id) {
      throw new ForbiddenException('Not authorized to access this note');
    }

    return note;
  }

  async isArchived(noteId: number, userId: number): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId, userId);
    return note?.archivedAt !== null;
  }

  async getNoteNamesByIds(
    noteIds: number[],
    userId: number
  ): Promise<{ id: number; name: string }[]> {
    return await this.getNoteNamesByIdsTS.apply(noteIds, userId);
  }

  // NoteWriterPort implementation
  async createNoteWithMemo(
    name: string,
    description: string | undefined,
    userId: number
  ): Promise<number> {
    const note = new Note();
    note.name = name;
    note.userId = userId;
    note.archivedAt = null;

    if (description) {
      const memo = new Memo();
      memo.description = description;
      note.memo = memo;
    }

    const saved = await this.noteRepository.save(note);
    return saved.id;
  }

  async replaceDescription(noteId: number, description: string): Promise<void> {
    const note = await this.noteRepository.findById(noteId, undefined);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.memo) {
      note.memo.description = description;
    } else {
      const memo = new Memo();
      memo.description = description;
      note.memo = memo;
    }

    await this.noteRepository.save(note);
  }

  async archiveNotes(noteIds: number[], userId: number): Promise<void> {
    for (const noteId of noteIds) {
      const note = await this.noteRepository.findById(noteId, userId);
      if (note) {
        note.archivedAt = new Date();
        await this.noteRepository.save(note);
      }
    }
  }
}
