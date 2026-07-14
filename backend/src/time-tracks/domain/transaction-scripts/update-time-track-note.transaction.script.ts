import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';
import { TimeTrackResponseDto } from '../../apps/dtos/responses/time-track.response.dto';
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
  ): Promise<TimeTrackResponseDto> {
    const updates = this.payloadConverter.apply(payload);

    const updated = await this.timeTrackRepository.updateByIdAndUserId(
      id,
      userId,
      updates
    );
    if (!updated) {
      throw new NotFoundException('Time track not found or not owned by user');
    }
    return new TimeTrackResponseDto(updated);
  }
}
