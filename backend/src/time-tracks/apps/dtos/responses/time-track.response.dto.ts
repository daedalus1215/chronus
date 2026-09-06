export class TimeTrackResponseDto {
  id: number;
  userId: number;
  noteId: number;
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(timeTrack: {
    id: number;
    userId: number;
    noteId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = timeTrack.id;
    this.userId = timeTrack.userId;
    this.noteId = timeTrack.noteId;
    this.date = timeTrack.date;
    this.startTime = timeTrack.startTime;
    this.durationMinutes = timeTrack.durationMinutes;
    this.note = timeTrack.note;
    this.createdAt = timeTrack.createdAt;
    this.updatedAt = timeTrack.updatedAt;
  }
}
