import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCheckItemsByNoteDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').filter(Boolean);
  })
  status?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeDone?: boolean = true;
}
