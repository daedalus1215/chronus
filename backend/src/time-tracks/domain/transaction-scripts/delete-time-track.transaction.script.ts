import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeTrackRepository } from '../../infra/repositories/time-track.repository';

@Injectable()
export class DeleteTimeTrackTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(id: number, userId: number): Promise<void> {
    const deleted = await this.timeTrackRepository.deleteByIdAndUserId(id, userId);
    if (!deleted) {
      throw new NotFoundException('Time track not found or not owned by user');
    }
  }
} 