export type GetNoteDetailsCommand = {
  noteId: number;
  userId: number;
};

export const GET_NOTE_DETAILS_COMMAND = 'notes.get-details';
