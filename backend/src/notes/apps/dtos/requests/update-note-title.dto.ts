import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNoteTitleDto {
  @ApiProperty({ description: 'The title of the note' })
  @IsString()
  name: string;
}
