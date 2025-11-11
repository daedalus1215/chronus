export type DeleteNoteTagAssociationsCommand = {
  noteId: number;
  userId: number;
};

export const DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND = 'tags.delete-note-associations';
