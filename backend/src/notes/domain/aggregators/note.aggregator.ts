import { Injectable } from '@nestjs/common';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';

type NoteReference = {
  id: number;
  name: string;
  userId: string;
}

//@TODO: all methods should be deferring to transaction scripts
@Injectable()
export class NoteAggregator {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async exists(noteId: number): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId);
    return !!note;
  }

  async getReference(noteId: number): Promise<NoteReference | null> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) return null;

    return {
      id: note.id,
      name: note.name,
      userId: note.userId
    };
  }

  async belongsToUser(params:{noteId: number, userId: string}): Promise<boolean> {
    const note = await this.noteRepository.findById(params.noteId);
    return note?.userId === params.userId;
  }

  async isArchived(noteId: number): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId);
    return note?.archived_date !== null;
  }
} 