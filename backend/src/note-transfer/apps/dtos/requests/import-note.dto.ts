import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  IsDateString,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class CheckItemImportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsIn(['ready', 'in_progress', 'review', 'done'])
  status: 'ready' | 'in_progress' | 'review' | 'done';

  // Order is informational only — the writer re-bases it onto the target list
  // by array position, so any integer (incl. legacy negative values) is accepted.
  @IsNumber()
  order: number;

  @IsDateString()
  @IsOptional()
  doneDate?: string | null;

  @IsDateString()
  @IsOptional()
  archiveDate?: string | null;
}

class TimeTrackImportDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsNumber()
  @Min(1)
  durationMinutes: number;
}

export class ImportNoteDto {
  @IsNumber()
  @Min(1)
  version: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckItemImportDto)
  @IsOptional()
  checkItems?: CheckItemImportDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeTrackImportDto)
  @IsOptional()
  timeTracks?: TimeTrackImportDto[];
}
