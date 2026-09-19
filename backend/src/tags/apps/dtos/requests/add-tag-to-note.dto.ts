import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTagToNoteDto {
  @ApiProperty({ description: 'The ID of the note' })
  @IsNumber()
  noteId: number;

  @ApiProperty({ description: 'The ID of the tag (optional)' })
  @IsString()
  @IsOptional()
  tagId?: number;

  @ApiProperty({ description: 'The name of the tag (optional)' })
  @IsString()
  @IsOptional()
  tagName?: string;
}
