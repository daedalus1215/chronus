// src/notes/apps/dtos/update-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({ description: 'The title of the note', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The content of the note', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  tags?: { id: string; name: string; description: string }[];

  /**
   * Internal flag to skip version capture when loading a version.
   * This prevents creating a new version entry when restoring from history.
   */
  @IsOptional()
  @IsBoolean()
  skipVersionCapture?: boolean;
}
