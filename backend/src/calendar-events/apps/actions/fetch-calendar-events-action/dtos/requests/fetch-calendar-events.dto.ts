import { IsDateString, IsNotEmpty } from 'class-validator';

export class FetchCalendarEventsRequestDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

