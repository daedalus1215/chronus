import { Injectable, NotFoundException } from "@nestjs/common";
import { Note } from "../../entities/notes/note.entity";
import { NoteMemoTagRepository } from "../../../infra/repositories/note-memo-tag.repository";

@Injectable()
export class ArchiveNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository
  ) {}

  async apply(noteId: number, userId: number): Promise<Note> {
    const note = await this.noteRepository.findById(noteId, userId);
    
    if (!note) {
      throw new NotFoundException("Note not found");
    }

    if (note.userId !== userId) {
      throw new NotFoundException("Not authorized to archive this note");
    }

    note.archivedAt = new Date();
    return await this.noteRepository.save(note);
  }
} 