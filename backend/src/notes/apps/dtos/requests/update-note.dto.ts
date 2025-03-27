// src/notes/apps/dtos/update-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({ description: 'The title of the note', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The content of the note', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Array of tag names', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}