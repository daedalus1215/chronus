import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

export type GetNoteTimeTracksCommand = {
  noteId: number;
  user: AuthUser;
};
