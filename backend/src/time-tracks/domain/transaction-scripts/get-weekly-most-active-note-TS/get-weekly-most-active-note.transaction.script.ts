import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { WeeklyMostActiveNoteResponseDto } from '../../../apps/dtos/responses/weekly-most-active-note.response.dto';
import { NoteAggregator } from 'src/notes/domain/aggregators/note.aggregator';

@Injectable()
export class GetWeeklyMostActiveNoteTransactionScript {
  constructor(
    private readonly timeTrackRepository: TimeTrackRepository,
    private readonly noteAggregator: NoteAggregator,
  ) {}

  async apply(userId: number): Promise<WeeklyMostActiveNoteResponseDto> {
    const result = await this.timeTrackRepository.getWeeklyMostActiveNote(userId);
    if (!result) {
      return null;
    }

    console.log('resssssssssult', result);

    //@TODO: refactor to use event emitter
    const note = await this.noteAggregator.getReference(result.noteId, userId);
    
    return {
      noteId: result.noteId,
      noteName: note.name,
      totalTimeMinutes: result.totalTimeMinutes,
      weekStartDate: result.weekStartDate,
      weekEndDate: result.weekEndDate,
    };
  }
}   