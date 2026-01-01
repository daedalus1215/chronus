import { AuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";

export type GetTimeTracksTotalByNoteIdCommand = {
  noteId: number;
  user: AuthUser;
} 