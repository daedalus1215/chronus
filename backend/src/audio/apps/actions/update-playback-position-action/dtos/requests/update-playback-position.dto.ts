import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdatePlaybackPositionDto {
  @IsNumber()
  @Min(0)
  positionSeconds: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;
}
