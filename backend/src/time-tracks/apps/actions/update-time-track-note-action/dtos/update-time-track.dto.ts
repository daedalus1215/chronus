import { IsOptional, IsString } from 'class-validator';

export class UpdateTimeTrackDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsOptional()
  durationMinutes?: number;

  @IsOptional()
  noteId?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
