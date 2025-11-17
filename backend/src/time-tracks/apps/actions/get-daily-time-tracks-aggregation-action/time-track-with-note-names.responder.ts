import { Injectable } from '@nestjs/common';
import { TimeTrackWithNoteNamesDto } from './time-track-with-note-names.dto';

export type TimeTrackWithNoteNamesInput = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

export type NoteNameReference = {
  id: number;
  name: string;
};

@Injectable()
export class TimeTrackWithNoteNamesResponder {
  apply(
    projection: {
      trackTimeTracks: TimeTrackWithNoteNamesInput[],
      noteNames: NoteNameReference[]
    }
  ): TimeTrackWithNoteNamesDto[] {
    return projection.trackTimeTracks.map(track => {
      const noteName = projection.noteNames.find(note => note.id === track.noteId);
      return {
        ...track,
        noteName: noteName?.name || 'Unknown Note'
      };
    });
  }
} 