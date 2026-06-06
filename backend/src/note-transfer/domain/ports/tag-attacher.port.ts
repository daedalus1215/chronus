/**
 * Port for attaching tags to notes by name.
 * Implemented by the tags module, used by note-transfer.
 */
export interface TagAttacherPort {
  /**
   * Resolves tags by name (creating them if they don't exist) and attaches them to the note.
   * Tags that are already attached are silently skipped.
   * @param noteId - The note ID to attach tags to
   * @param userId - The owner user ID
   * @param tagNames - Array of tag names to attach
   */
  attachByName(
    noteId: number,
    userId: number,
    tagNames: string[]
  ): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const TAG_ATTACH_PORT = Symbol('TAG_ATTACH_PORT');
