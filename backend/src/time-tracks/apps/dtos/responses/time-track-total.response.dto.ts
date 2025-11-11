export class TimeTrackTotalResponseDto {
  totalMinutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutesRemainder: number;

  constructor(totalMinutes: number) {
    this.totalMinutes = totalMinutes;
    this.totalDays = Math.floor(totalMinutes / (24 * 60));
    this.totalHours = Math.floor((totalMinutes % (24 * 60)) / 60);
    this.totalMinutesRemainder = totalMinutes % 60;
  }
} 