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
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class CheckItemMergeDto {
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

class TimeTrackMergeDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @IsString()
  @IsOptional()
  note?: string;
}

class SourceNoteSelectionDto {
  @IsNumber()
  @Min(1)
  noteId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckItemMergeDto)
  @IsOptional()
  checkItems?: CheckItemMergeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeTrackMergeDto)
  @IsOptional()
  timeTracks?: TimeTrackMergeDto[];
}

export class MergeNotesDto {
  @IsNumber()
  @Min(1)
  targetNoteId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceNoteSelectionDto)
  @ArrayMinSize(1)
  sources: SourceNoteSelectionDto[];

  @IsNumber()
  @Min(1)
  version: number;
}
