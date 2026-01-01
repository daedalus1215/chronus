import { Controller, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { ArchiveNoteSwagger } from "./archive-note.swagger";
import { GetAuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";
import { AuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";
import { Note } from "src/notes/domain/entities/notes/note.entity";
import { NoteService } from "src/notes/domain/services/note.service";

@Controller("notes")
export class ArchiveNoteAction {
  constructor(private readonly noteService: NoteService) {}

  @Patch(":id/archive")
  @ProtectedAction(ArchiveNoteSwagger)
  async apply(
    @Param("id", ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<Note> {
    return await this.noteService.archiveNote(id, authUser);
  }
} 