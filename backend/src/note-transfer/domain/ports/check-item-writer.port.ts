/**
 * Port for bulk creating check items.
 * Implemented by the check-items module, used by note-transfer.
 */
export interface CheckItemWriterPort {
  /**
   * Bulk creates check items for a note.
   * The order values are preserved from the input items.
   * @param noteId - The note ID to attach check items to
   * @param items - Array of check item data
   */
  bulkCreate(
    noteId: number,
    items: Array<{
      name: string;
      description: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate: Date | null;
      archiveDate: Date | null;
    }>
  ): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const CHECK_ITEM_WRITER_PORT = Symbol('CHECK_ITEM_WRITER_PORT');
