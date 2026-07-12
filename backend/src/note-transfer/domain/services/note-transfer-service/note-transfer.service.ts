import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NoteAggregator } from '../../../../notes/domain/aggregators/note.aggregator';
import { NOTE_WRITER_PORT, NoteWriterPort } from '../../ports/note-writer.port';
import {
  CHECK_ITEM_WRITER_PORT,
  CheckItemWriterPort,
} from '../../ports/check-item-writer.port';
import {
  TIME_TRACK_WRITER_PORT,
  TimeTrackWriterPort,
} from '../../ports/time-track-writer.port';
import {
  TAG_ATTACH_PORT,
  TagAttacherPort,
} from '../../ports/tag-attacher.port';
import { AUDIO_PURGE_PORT, AudioPurgePort } from '../../ports/audio-purge.port';
import { ImportNoteDto } from '../../../apps/dtos/requests/import-note.dto';
import { MergeIntoNoteDto } from '../../../apps/dtos/requests/merge-into-note.dto';
import { MergeNotesDto } from '../../../apps/actions/merge-notes-action/merge-notes.request.dto';
import { NoteExportResponse } from '../../../apps/dtos/responses/note-export.response';
import { ExportNote } from './export-note';
import { ImportNote } from './import-note';

/**
 * Service for orchestrating note export and import operations.
 * This service coordinates reads via aggregators and writes via ports.
 */
@Injectable()
export class NoteTransferService {
  constructor(
    private readonly noteAggregator: NoteAggregator,
    @Inject(NOTE_WRITER_PORT)
    private readonly noteWriterPort: NoteWriterPort,
    @Inject(CHECK_ITEM_WRITER_PORT)
    private readonly checkItemWriterPort: CheckItemWriterPort,
    @Inject(TIME_TRACK_WRITER_PORT)
    private readonly timeTrackWriterPort: TimeTrackWriterPort,
    @Inject(TAG_ATTACH_PORT)
    private readonly tagAttacherPort: TagAttacherPort,
    @Inject(AUDIO_PURGE_PORT)
    private readonly audioPurgePort: AudioPurgePort,
    private readonly exportNoteFn: ExportNote,
    private readonly importNoteFn: ImportNote
  ) {}

  /**
   * Exports a single note with all its associated data.
   * Returns a payload that can be serialized to a .chronus file.
   */
  async exportNote(
    noteId: number,
    userId: number
  ): Promise<NoteExportResponse> {
    return this.exportNoteFn.apply(noteId, userId);
  }

  /**
   * Imports a note as a new memo.
   * Creates a new note with the provided data sections.
   * @returns The newly created note ID
   */
  async importNote(payload: ImportNoteDto, userId: number): Promise<number> {
    return this.importNoteFn.apply(payload, userId);
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

  /**
   * Merges multiple source notes into a target note.
   * Sources are archived after their content is appended to the target.
   * Audio files from sources are deleted (not moved to target).
   */
  async mergeNotes(payload: MergeNotesDto, userId: number): Promise<void> {
    // Validate version
    if (payload.version !== 1) {
      throw new BadRequestException(
        `Unsupported export version: ${payload.version}`
      );
    }

    const { targetNoteId, sources } = payload;

    // Validate: at least 2 notes (target + 1 source)
    if (sources.length < 1) {
      throw new BadRequestException('At least one source note is required');
    }

    // Validate: target note exists and user owns it
    const targetNote = await this.noteAggregator.getReference(
      targetNoteId,
      userId
    );
    if (!targetNote) {
      throw new NotFoundException('Target note not found');
    }

    // Validate: all source notes exist and user owns them
    const sourceNoteIds = sources.map(s => s.noteId);
    for (const sourceId of sourceNoteIds) {
      const sourceNote = await this.noteAggregator.getReference(
        sourceId,
        userId
      );
      if (!sourceNote) {
        throw new NotFoundException(`Source note ${sourceId} not found`);
      }
    }

    // Defensive: check combined description size (soft limit: 1,000,000 chars)
    const MAX_DESCRIPTION_LENGTH = 1_000_000;
    let combinedDescriptionLength = 0;

    // Get target's current description
    try {
      const targetWithMemo = await this.noteAggregator.getMemoById(
        targetNoteId,
        userId
      );
      if (targetWithMemo?.memo?.description) {
        combinedDescriptionLength += targetWithMemo.memo.description.length;
      }
    } catch {
      // Target is not a memo (checklist) - no description
    }

    for (const source of sources) {
      if (source.description) {
        combinedDescriptionLength += source.description.length;
        // Add overhead for heading separator
        combinedDescriptionLength += 50; // Approximate heading size
      }
    }

    if (combinedDescriptionLength > MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `Combined description would exceed ${MAX_DESCRIPTION_LENGTH} characters. Please merge fewer notes or remove some content.`
      );
    }

    // Perform the merge operations (best-effort sequential execution)
    // Note: Full transactional consistency would require a saga pattern;
    // for merge notes we prioritize availability over strict consistency

    // 1. Build and update description
    const descriptionParts: string[] = [];

    for (const source of sources) {
      if (source.description?.trim()) {
        descriptionParts.push(`## ${source.name}\n\n${source.description}`);
      }
    }

    if (descriptionParts.length > 0) {
      // Get target's current description
      let targetDescription = '';
      try {
        const targetWithMemo = await this.noteAggregator.getMemoById(
          targetNoteId,
          userId
        );
        targetDescription = targetWithMemo?.memo?.description ?? '';
      } catch {
        // Target is a checklist - converting to memo with description
      }

      const newDescription = targetDescription
        ? `${targetDescription}\n\n${descriptionParts.join('\n\n')}`
        : descriptionParts.join('\n\n');

      await this.noteWriterPort.replaceDescription(
        targetNoteId,
        newDescription
      );
    }

    // 2. Merge check items (blind append, skip archived, rebase order)
    for (const source of sources) {
      if (source.checkItems && source.checkItems.length > 0) {
        const activeItems = source.checkItems.filter(item => !item.archiveDate);
        if (activeItems.length > 0) {
          await this.checkItemWriterPort.bulkCreate(
            targetNoteId,
            activeItems.map(item => ({
              name: item.name,
              description: item.description ?? null,
              status: item.status,
              order: item.order,
              doneDate: item.doneDate ? new Date(item.doneDate) : null,
              archiveDate: null,
            }))
          );
        }
      }
    }

    // 3. Merge time tracks (blind append, preserve annotation)
    for (const source of sources) {
      if (source.timeTracks && source.timeTracks.length > 0) {
        await this.timeTrackWriterPort.bulkCreate(
          targetNoteId,
          userId,
          source.timeTracks.map(track => ({
            date: track.date,
            startTime: track.startTime,
            durationMinutes: track.durationMinutes,
            note: track.note,
          }))
        );
      }
    }

    // 4. Merge tags (union, deduped)
    const allTagNames = new Set<string>();
    for (const source of sources) {
      if (source.tags) {
        for (const tag of source.tags) {
          allTagNames.add(tag);
        }
      }
    }
    if (allTagNames.size > 0) {
      await this.tagAttacherPort.attachByName(targetNoteId, userId, [
        ...allTagNames,
      ]);
    }

    // 5. Archive source notes (soft delete)
    await this.noteWriterPort.archiveNotes(sourceNoteIds, userId);

    // 6. Purge audio from source notes (best-effort, after transaction)
    // We do this outside the transaction because Hermes deletes cannot be rolled back
    // Note: note ownership already validated above
    try {
      await this.audioPurgePort.purgeByNoteIds(sourceNoteIds);
    } catch (error) {
      // Log but don't fail - audio is non-critical compared to note data
      console.warn('Failed to purge some audio files during merge:', error);
    }
  }
}
