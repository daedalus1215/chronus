
export class WeeklyMostActiveNoteResponseDto {
    noteId: number;
    noteName: string;
    totalTimeMinutes: number;
    weekStartDate: string;
    weekEndDate: string;

    constructor(weeklyMostActiveNote: {
        noteId: number;
        noteName: string;
        totalTimeMinutes: number;
        weekStartDate: string;
        weekEndDate: string;
    }) {
        this.noteId = weeklyMostActiveNote.noteId;
        this.noteName = weeklyMostActiveNote.noteName;
        this.totalTimeMinutes = weeklyMostActiveNote.totalTimeMinutes;
        this.weekStartDate = weeklyMostActiveNote.weekStartDate;
        this.weekEndDate = weeklyMostActiveNote.weekEndDate;
    }
  }