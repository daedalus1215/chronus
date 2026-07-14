export class TimeTrackWithNoteResponse {
  id: number;
  noteId: number;
  noteName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: string;
  updatedAt: string;

  constructor(track: {
    id: number;
    noteId: number;
    noteName: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = track.id;
    this.noteId = track.noteId;
    this.noteName = track.noteName;
    this.date = track.date;
    this.startTime = track.startTime;
    this.durationMinutes = track.durationMinutes;
    this.note = track.note;
    this.createdAt = track.createdAt;
    this.updatedAt = track.updatedAt;
  }
}
