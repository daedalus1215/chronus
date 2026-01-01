import { AuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";

export type CreateTimeTrackCommand = {  
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  user: AuthUser
} 