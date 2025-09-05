export type DeleteCheckItemsByNoteCommand = {
  noteId: number;
  userId: number;
};

export const DELETE_CHECK_ITEMS_BY_NOTE_COMMAND = 'check-items.delete-by-note';
