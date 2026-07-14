import { Injectable } from '@nestjs/common';

export type UpdateTimeTrackPayload = {
  date?: string;
  startTime?: string;
  durationMinutes?: number;
  noteId?: number;
  note?: string;
};

const FIELDS: readonly (keyof UpdateTimeTrackPayload)[] = [
  'date',
  'startTime',
  'durationMinutes',
  'noteId',
  'note',
];

@Injectable()
export class UpdateTimeTrackPayloadConverter {
  apply(payload: UpdateTimeTrackPayload): Record<string, unknown> {
    return Object.fromEntries(
      FIELDS.filter(
        (field): field is keyof UpdateTimeTrackPayload =>
          payload[field] !== undefined
      ).map(field => [field, payload[field]!])
    );
  }
}
