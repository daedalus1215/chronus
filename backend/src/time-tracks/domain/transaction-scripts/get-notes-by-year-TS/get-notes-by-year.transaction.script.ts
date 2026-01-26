import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { GetNotesByYearCommand } from './get-notes-by-year.command';

type NoteByYear = {
  noteId: number;
  year: number;
  firstDate: string;
  lastDate: string;
  totalTimeMinutes: number;
  dateCount: number;
};

@Injectable()
export class GetNotesByYearTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(command: GetNotesByYearCommand): Promise<NoteByYear[]> {
    return await this.timeTrackRepository.getNotesByYear(command.user.userId);
  }
}
