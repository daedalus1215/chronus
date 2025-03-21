import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'The name of the note' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User ID of the note owner' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Is this note a memo?' })
  @IsBoolean()
  @IsOptional()
  isMemo?: boolean;
}