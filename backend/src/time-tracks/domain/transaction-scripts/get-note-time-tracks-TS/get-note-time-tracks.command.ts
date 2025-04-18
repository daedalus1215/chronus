import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

export type GetNoteTimeTracksCommand = {
  noteId: number;
  user: AuthUser
} 