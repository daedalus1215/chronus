/**
 * Port for bulk creating time tracks.
 * Implemented by the time-tracks module, used by note-transfer.
 */
export interface TimeTrackWriterPort {
  /**
   * Bulk creates time tracks for a note.
   * @param noteId - The note ID to attach time tracks to
   * @param userId - The owner user ID
   * @param logs - Array of time track data
   */
  bulkCreate(
    noteId: number,
    userId: number,
    logs: Array<{
      date: string; // YYYY-MM-DD
      startTime: string; // HH:mm
      durationMinutes: number;
      note?: string; // Optional per-entry annotation
    }>
  ): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const TIME_TRACK_WRITER_PORT = Symbol('TIME_TRACK_WRITER_PORT');
