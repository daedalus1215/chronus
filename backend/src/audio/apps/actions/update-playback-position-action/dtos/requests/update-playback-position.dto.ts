import { IsNumber, Min } from 'class-validator';

export class UpdatePlaybackPositionDto {
  @IsNumber()
  @Min(0)
  positionSeconds: number;
}
