import { Injectable } from '@nestjs/common';

/**
 * Port for checking note ownership.
 * Implemented by the notes module, used by the audio module.
 */
export interface NoteOwnershipPort {
  /**
   * Verifies that a user owns a specific note.
   * @param noteId - The ID of the note to check
   * @param userId - The ID of the user to verify ownership for
   * @returns Promise<boolean> - True if user owns the note, false otherwise
   */
  verifyOwnership(noteId: number, userId: number): Promise<boolean>;
}

/**
 * Token for dependency injection
 */
export const NOTE_OWNERSHIP_PORT = Symbol('NOTE_OWNERSHIP_PORT');
