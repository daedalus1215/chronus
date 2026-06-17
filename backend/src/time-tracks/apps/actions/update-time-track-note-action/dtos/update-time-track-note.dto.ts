import { IsOptional, IsString } from 'class-validator';

export class UpdateTimeTrackNoteDto {
  @IsString()
  @IsOptional()
  note?: string;
}
