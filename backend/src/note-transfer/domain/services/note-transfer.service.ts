import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NoteAggregator } from '../../../notes/domain/aggregators/note.aggregator';
import { CheckItemsAggregator } from '../../../check-items/domain/aggregators/check-items.aggregator';
import {
  NOTE_WRITER_PORT,
  NoteWriterPort,
} from '../ports/note-writer.port';
import {
  CHECK_ITEM_WRITER_PORT,
  CheckItemWriterPort,
} from '../ports/check-item-writer.port';
import {
  TIME_TRACK_WRITER_PORT,
  TimeTrackWriterPort,
} from '../ports/time-track-writer.port';
import {
  TAG_ATTACH_PORT,
  TagAttacherPort,
} from '../ports/tag-attacher.port';
import { ImportNoteDto } from '../../apps/dtos/requests/import-note.dto';
import { MergeIntoNoteDto } from '../../apps/dtos/requests/merge-into-note.dto';
import { NoteExportResponse } from '../../apps/dtos/responses/note-export.response';
import { TimeTracksAggregator } from '../../../time-tracks/domain/aggregators/time-tracks.aggregator';
import { TagAggregator } from '../../../tags/domain/aggregators/tag.aggregator';

/**
 * Service for orchestrating note export and import operations.
 * This service coordinates reads via aggregators and writes via ports.
 */
@Injectable()
export class NoteTransferService {
  constructor(
    private readonly noteAggregator: NoteAggregator,
    private readonly checkItemsAggregator: CheckItemsAggregator,
    private readonly timeTracksAggregator: TimeTracksAggregator,
    private readonly tagAggregator: TagAggregator,
    @Inject(NOTE_WRITER_PORT)
    private readonly noteWriterPort: NoteWriterPort,
    @Inject(CHECK_ITEM_WRITER_PORT)
    private readonly checkItemWriterPort: CheckItemWriterPort,
    @Inject(TIME_TRACK_WRITER_PORT)
    private readonly timeTrackWriterPort: TimeTrackWriterPort,
    @Inject(TAG_ATTACH_PORT)
    private readonly tagAttacherPort: TagAttacherPort
  ) {}

  /**
   * Exports a single note with all its associated data.
   * Returns a payload that can be serialized to a .chronus file.
   */
  async exportNote(
    noteId: number,
    userId: number
  ): Promise<NoteExportResponse> {
    // 1. Verify ownership and get note
    const note = await this.noteAggregator.getReference(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Try to get memo description (will be empty for checklists)
    let description = '';
    try {
      const noteWithMemo = await this.noteAggregator.getMemoById(noteId, userId);
      description = noteWithMemo?.memo?.description ?? '';
    } catch {
      // Not a memo - description stays empty
    }

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

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      memo: {
        name: note.name,
        description,
        tags,
        checkItems: activeCheckItems.map((item, index) => ({
          name: item.name,
          description: item.description,
          status: item.status,
          order: index,
          doneDate: item.doneDate ? new Date(item.doneDate).toISOString() : null,
          archiveDate: item.archiveDate ? new Date(item.archiveDate).toISOString() : null,
        })),
        timeTracks,
      },
    };
  }

  /**
   * Imports a note as a new memo.
   * Creates a new note with the provided data sections.
   * @returns The newly created note ID
   */
  async importNote(
    payload: ImportNoteDto,
    userId: number
  ): Promise<number> {
    // Validate version
    if (payload.version !== 1) {
      throw new BadRequestException(
        `Unsupported export version: ${payload.version}`
      );
    }

    // 1. Create note + memo
    const newNoteId = await this.noteWriterPort.createNoteWithMemo(
      payload.name,
      payload.description,
      userId
    );

    // 2. Create check items if provided
    if (payload.checkItems && payload.checkItems.length > 0) {
      await this.checkItemWriterPort.bulkCreate(
        newNoteId,
        payload.checkItems.map(item => ({
          name: item.name,
          description: item.description ?? null,
          status: item.status,
          order: item.order,
          doneDate: item.doneDate ? new Date(item.doneDate) : null,
          archiveDate: item.archiveDate ? new Date(item.archiveDate) : null,
        }))
      );
    }

    // 3. Create time tracks if provided
    if (payload.timeTracks && payload.timeTracks.length > 0) {
      await this.timeTrackWriterPort.bulkCreate(
        newNoteId,
        userId,
        payload.timeTracks
      );
    }

    // 4. Attach tags if provided
    if (payload.tags && payload.tags.length > 0) {
      await this.tagAttacherPort.attachByName(newNoteId, userId, payload.tags);
    }

    return newNoteId;
  }

  /**
   * Merges selected pieces from an imported file into an existing note.
   */
  async mergeIntoNote(
    noteId: number,
    payload: MergeIntoNoteDto,
    userId: number
  ): Promise<void> {
    // Validate version
    if (payload.version !== 1) {
      throw new BadRequestException(
        `Unsupported export version: ${payload.version}`
      );
    }

    // 1. Verify ownership
    const note = await this.noteAggregator.getReference(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // 2. Replace description if provided
    if (payload.description !== undefined) {
      await this.noteWriterPort.replaceDescription(noteId, payload.description);
    }

    // 3. Add time tracks if provided
    if (payload.timeTracks && payload.timeTracks.length > 0) {
      await this.timeTrackWriterPort.bulkCreate(
        noteId,
        userId,
        payload.timeTracks
      );
    }

    // 4. Add check items if provided
    if (payload.checkItems && payload.checkItems.length > 0) {
      await this.checkItemWriterPort.bulkCreate(
        noteId,
        payload.checkItems.map(item => ({
          name: item.name,
          description: item.description ?? null,
          status: item.status,
          order: item.order,
          doneDate: item.doneDate ? new Date(item.doneDate) : null,
          archiveDate: item.archiveDate ? new Date(item.archiveDate) : null,
        }))
      );
    }

    // 5. Attach tags if provided
    if (payload.tags && payload.tags.length > 0) {
      await this.tagAttacherPort.attachByName(noteId, userId, payload.tags);
    }
  }
}