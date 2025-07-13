import { Injectable } from "@nestjs/common";
import { Note } from "../entities/notes/note.entity";
import { ArchiveNoteTransactionScript } from "../transaction-scripts/archive-note/archive-note.transaction.script";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

@Injectable()
export class NoteService {
  constructor(
    private readonly archiveNoteTransactionScript: ArchiveNoteTransactionScript
  ) {}

  async archiveNote(noteId: number, authUser: AuthUser): Promise<Note> {
    return await this.archiveNoteTransactionScript.apply(noteId, authUser.userId);
  }
} 