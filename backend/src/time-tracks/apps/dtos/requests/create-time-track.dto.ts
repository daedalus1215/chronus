import { IsDate, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateTimeTrackDto {
  @IsDate()
  date: Date;

  @IsString()
  startTime: string;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max minutes in a day
  durationMinutes: number;

  @IsString()
  @IsOptional()
  note?: string;
} 