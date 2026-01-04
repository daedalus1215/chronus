import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'The name of the note' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Is this note a memo?' })
  @IsBoolean()
  @IsOptional()
  isMemo?: boolean;
}
