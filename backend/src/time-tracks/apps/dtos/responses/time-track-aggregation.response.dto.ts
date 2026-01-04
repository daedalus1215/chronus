export class TimeTrackAggregationResponseDto {
  noteId: number;
  noteTitle: string;
  totalTimeMinutes: number;
  dailyTimeMinutes: number;
  mostRecentStartTime: string;
  mostRecentDate: string;

  constructor(aggregation: {
    noteId: number;
    noteTitle: string;
    totalTimeMinutes: number;
    dailyTimeMinutes: number;
    mostRecentStartTime: string;
    mostRecentDate: string;
  }) {
    this.noteId = aggregation.noteId;
    this.noteTitle = aggregation.noteTitle;
    this.totalTimeMinutes = aggregation.totalTimeMinutes;
    this.dailyTimeMinutes = aggregation.dailyTimeMinutes;
    this.mostRecentStartTime = aggregation.mostRecentStartTime;
    this.mostRecentDate = aggregation.mostRecentDate;
  }
}
