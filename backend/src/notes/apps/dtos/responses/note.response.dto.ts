import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../../domain/entities/notes/note.entity';
import { Tag } from '../../../domain/entities/tag/tag.entity';

export class NoteResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [Tag] })
  tags: Tag[];

  @ApiProperty()
  description: string;

  constructor(note: Note) {
    this.id = note.id;
    this.name = note.name;
    this.content = note.memo?.description || '';
    this.userId = note.userId;
    this.createdAt = new Date(note.createdAt);
    this.updatedAt = new Date(note.updatedAt);
    this.description = note.memo?.description || '';
    this.tags = note.tags;
  }
} 