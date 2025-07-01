import { ApiProperty } from '@nestjs/swagger';
import { Tag } from 'src/notes/domain/entities/tag/tag.entity';

export class TagResponseDto {
  @ApiProperty({ description: 'The ID of the tag' })
  id: string;

  @ApiProperty({ description: 'The name of the tag' })
  name: string;

  @ApiProperty({ description: 'The description of the tag' })
  description: string;

  constructor(tag: Tag) {
    this.id = tag.id;
    this.name = tag.name;
    this.description = tag.description;
  }
} 