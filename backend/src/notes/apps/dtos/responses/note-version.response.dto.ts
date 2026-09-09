import { ApiProperty } from '@nestjs/swagger';

export class NoteVersionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  versionNum: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;
}
