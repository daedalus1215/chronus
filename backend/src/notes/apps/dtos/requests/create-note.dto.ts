import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'The name of the note' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Is this note a memo?' })
  @IsBoolean()
  @IsOptional()
  isMemo?: boolean;

  @ApiProperty({ description: 'Folder to create the note in', required: false })
  @IsNumber()
  @IsOptional()
  folderId?: number;
}
