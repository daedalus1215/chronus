import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';
import { TimeTrackResponseDto } from '../../apps/dtos/responses/time-track.response.dto';

@Injectable()
export class UpdateTimeTrackNoteTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(
    id: number,
    userId: number,
    note: string | null
  ): Promise<TimeTrackResponseDto> {
    const updated = await this.timeTrackRepository.updateNoteByIdAndUserId(
      id,
      userId,
      note
    );
    if (!updated) {
      throw new NotFoundException('Time track not found or not owned by user');
    }
    return new TimeTrackResponseDto(updated);
  }
}
