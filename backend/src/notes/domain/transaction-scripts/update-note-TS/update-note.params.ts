export type UpdateNoteParams = {
  name?: string;
  description?: string;
  tags?: { id: string; name: string; description: string }[];
};

