/**
 * Port for writing notes and memos.
 * Implemented by the notes module, used by note-transfer.
 */
export interface NoteWriterPort {
  /**
   * Creates a new note with an associated memo.
   * @param name - The note title
   * @param description - The memo description (can be empty)
   * @param userId - The owner user ID
   * @returns The newly created note ID
   */
  createNoteWithMemo(
    name: string,
    description: string | undefined,
    userId: number
  ): Promise<number>;

  /**
   * Replaces the description of an existing memo, or creates a memo if the note doesn't have one.
   * @param noteId - The note ID
   * @param description - The new description
   */
  replaceDescription(noteId: number, description: string): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const NOTE_WRITER_PORT = Symbol('NOTE_WRITER_PORT');
