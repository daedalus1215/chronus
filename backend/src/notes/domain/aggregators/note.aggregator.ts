import { ForbiddenException, Injectable } from '@nestjs/common';
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

  async exists(noteId: number, userId: string): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId, userId);
    return !!note;
  }

  async getReference(noteId: number, userId: string): Promise<NoteReference | null> {
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) return null;

    return {
      id: note.id,
      name: note.name,
      userId: note.userId
    };
  }

  async belongsToUser(params:{noteId: number, user:{id: number}}) {
    //@TODO: refactor to use transaction script
    const note = await this.noteRepository.findById(params.noteId, params.user.id.toString());

    if (parseInt(note.userId) !== params.user.id) {
      throw new ForbiddenException('Not authorized to access this note');
    }
  }

  async isArchived(noteId: number, userId: string): Promise<boolean> {
    const note = await this.noteRepository.findById(noteId, userId);
    return note?.archivedDate !== null;
  }
} 