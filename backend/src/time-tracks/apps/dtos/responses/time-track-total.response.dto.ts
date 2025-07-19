export class TimeTrackTotalResponseDto {
  totalMinutes: number;
  totalHours: number;
  totalMinutesRemainder: number;

  constructor(totalMinutes: number) {
    this.totalMinutes = totalMinutes;
    this.totalHours = Math.floor(totalMinutes / 60);
    this.totalMinutesRemainder = totalMinutes % 60;
  }
} 