export type CreateNoteCommand = {
  name: string;
  userId: number;
  isMemo?: boolean;
  folderId?: number | null;
};
