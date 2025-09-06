import { ApiProperty } from '@nestjs/swagger';
import { Tag } from 'src/tags/domain/entities/tag.entity';

export class TagResponseDto {
  @ApiProperty({ description: 'The ID of the tag' })
  id: number;

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