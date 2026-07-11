import { Injectable, NotFoundException } from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { CheckItemsAggregator } from '../../../../check-items/domain/aggregators/check-items.aggregator';
import { TimeTracksAggregator } from '../../../../time-tracks/domain/aggregators/time-tracks.aggregator';
import { TagAggregator } from '../../../../tags/domain/aggregators/tag.aggregator';
import { NoteExportResponse } from '../../../apps/dtos/responses/note-export.response';
import { NoteExportConverter } from './note-export-converter';

/**
 * Functional class for exporting a single note with all its associated data.
 * Returns a payload that can be serialized to a .chronus file.
 */
@Injectable()
export class ExportNote {
  constructor(
    private readonly noteAggregator: NoteAggregator,
    private readonly checkItemsAggregator: CheckItemsAggregator,
    private readonly timeTracksAggregator: TimeTracksAggregator,
    private readonly tagAggregator: TagAggregator,
    private readonly converter: NoteExportConverter
  ) {}

  async apply(noteId: number, userId: number): Promise<NoteExportResponse> {
    // 1. Verify ownership and get note
    const note = await this.noteAggregator.getReference(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const noteWithMemo = await this.noteAggregator.getMemoById(
      noteId,
      userId
    );
    const description = noteWithMemo?.memo?.description ?? '';

    // 2. Get non-archived check items
    const checkItems = await this.checkItemsAggregator.findByNoteId(
      noteId,
      userId
    );
    // Sort by the stored order so the export reflects the user's ordering, then
    // re-index to contiguous 0-based values (the stored order can be negative or
    // sparse from reordering, which would fail the importer's `order >= 0` rule).
    const activeCheckItems = checkItems
      .filter(item => !item.archiveDate)
      .sort((a, b) => a.order - b.order);

    // 3. Get time tracks via the aggregator
    const timeTracks = await this.timeTracksAggregator.findByNoteId(
      noteId,
      userId
    );

    // 4. Get tag names via the tag aggregator
    const tags = await this.tagAggregator.getTagNamesByNoteId(noteId);

    return this.converter.convert(
      note.name,
      description,
      tags,
      activeCheckItems,
      timeTracks
    );
  }
}
