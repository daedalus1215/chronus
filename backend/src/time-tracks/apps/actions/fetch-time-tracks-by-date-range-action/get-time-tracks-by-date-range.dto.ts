import { IsDateString } from 'class-validator';

export class GetTimeTracksByDateRangeDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
