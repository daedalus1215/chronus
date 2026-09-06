import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import {
  UpdateTimeTrackPayload,
  UpdateTimeTrackPayloadConverter,
} from './update-time-track-note.converter';

@Injectable()
export class UpdateTimeTrackNoteTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository,
    private readonly payloadConverter: UpdateTimeTrackPayloadConverter
  ) {}

  async apply(
    id: number,
    userId: number,
    payload: UpdateTimeTrackPayload
  ): Promise<{
    id: number;
    userId: number;
    noteId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const updates = this.payloadConverter.apply(payload);

    const updated = await this.timeTrackRepository.updateByIdAndUserId(
      id,
      userId,
      updates
    );
    if (!updated) {
      throw new NotFoundException('Time track not found or not owned by user');
    }
    return updated;
  }
}
