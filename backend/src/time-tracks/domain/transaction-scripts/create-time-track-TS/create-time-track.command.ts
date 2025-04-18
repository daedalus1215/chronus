import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";

export type CreateTimeTrackCommand = {  
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  user: AuthUser
} 