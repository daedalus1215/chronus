export type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
  checkItems?: Array<CheckItem>;
};

export type CheckItem = {
  id: number;
  name: string;
  doneDate: string;
  archiveDate: string;
  noteId: number;
  order: number;
};
