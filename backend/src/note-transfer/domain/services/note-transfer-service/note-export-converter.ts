import { Injectable } from '@nestjs/common';
import { NoteExportResponse } from '../../../apps/dtos/responses/note-export.response';

/**
 * Converter that transforms internal note data into a NoteExportResponse.
 */
@Injectable()
export class NoteExportConverter {
  convert(
    name: string,
    description: string,
    tags: string[],
    checkItems: Array<{
      name: string;
      description: string | null;
      status: 'ready' | 'in_progress' | 'review' | 'done';
      order: number;
      doneDate: Date | string | null;
      archiveDate: Date | string | null;
    }>,
    timeTracks: Array<{
      date: string;
      startTime: string;
      durationMinutes: number;
    }>
  ): NoteExportResponse {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      memo: {
        name,
        description,
        tags,
        checkItems: checkItems.map((item, index) => ({
          name: item.name,
          description: item.description,
          status: item.status,
          order: index,
          doneDate:
            item.doneDate !== null ? new Date(item.doneDate).toISOString() : null,
          archiveDate:
            item.archiveDate !== null ? new Date(item.archiveDate).toISOString() : null,
        })),
        timeTracks,
      },
    };
  }
}
