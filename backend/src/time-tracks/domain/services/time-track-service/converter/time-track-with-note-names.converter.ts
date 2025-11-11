import { Injectable } from '@nestjs/common';

type TimeTrackWithNoteNamesInput = {
  noteId: number;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

type NoteNameReference = {
  id: number;
  name: string;
};

type TimeTrackWithNoteNamesOutput = {
  noteId: number;
  noteName: string;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;
};

@Injectable()
export class TimeTrackWithNoteNamesConverter {
  apply(
    timeTracks: TimeTrackWithNoteNamesInput[],
    noteNames: NoteNameReference[]
  ): TimeTrackWithNoteNamesOutput[] {
    return timeTracks.map(track => {
      const noteName = noteNames.find(note => note.id === track.noteId);
      return {
        ...track,
        noteName: noteName?.name || 'Unknown Note'
      };
    });
  }
} 