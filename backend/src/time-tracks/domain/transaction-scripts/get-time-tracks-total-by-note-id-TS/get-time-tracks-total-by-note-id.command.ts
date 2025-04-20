import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

export type GetTimeTracksTotalByNoteIdCommand = {
  noteId: number;
  user: AuthUser;
} 