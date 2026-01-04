import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateTimeTrackDto {
  @IsString()
  date: string;

  @IsString()
  startTime: string;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max minutes in a day
  durationMinutes: number;

  @IsNumber()
  noteId: number;

  @IsString()
  @IsOptional()
  note: string;
}
