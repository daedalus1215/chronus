/**
 * Port for purging (deleting) audio files from notes.
 * Implemented by the audio module, used by note-transfer for merge operations.
 * Caller is responsible for validating note ownership before calling.
 */
export interface AudioPurgePort {
  /**
   * Deletes all audio files associated with the given note IDs.
   * This deletes both the Hermes file storage and the database rows.
   * @param noteIds - Array of note IDs whose audio should be purged
   * @returns Array of file paths that were deleted (for logging)
   */
  purgeByNoteIds(noteIds: number[]): Promise<string[]>;
}

/**
 * Token for dependency injection
 */
export const AUDIO_PURGE_PORT = Symbol('AUDIO_PURGE_PORT');
