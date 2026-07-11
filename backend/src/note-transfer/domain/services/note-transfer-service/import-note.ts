import { Injectable, Inject, BadRequestException } from '@nestjs/common';
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
import { ImportNoteDto } from '../../../apps/dtos/requests/import-note.dto';

/**
 * Functional class for importing a note as a new memo.
 * Creates a new note with the provided data sections.
 */
@Injectable()
export class ImportNote {
  constructor(
    @Inject(NOTE_WRITER_PORT)
    private readonly noteWriterPort: NoteWriterPort,
    @Inject(CHECK_ITEM_WRITER_PORT)
    private readonly checkItemWriterPort: CheckItemWriterPort,
    @Inject(TIME_TRACK_WRITER_PORT)
    private readonly timeTrackWriterPort: TimeTrackWriterPort,
    @Inject(TAG_ATTACH_PORT)
    private readonly tagAttacherPort: TagAttacherPort
  ) {}

  async apply(payload: ImportNoteDto, userId: number): Promise<number> {
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
}
