// src/notes/apps/dtos/update-note.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}