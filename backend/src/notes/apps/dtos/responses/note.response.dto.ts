import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../../domain/entities/notes/note.entity';
import { Tag } from '../../../domain/entities/tag/tag.entity';
import { CheckItem } from 'src/notes/domain/entities/notes/check-item.entity';

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

  @ApiProperty({ type: [CheckItem] })
  checkItems: CheckItem[];

  @ApiProperty()
  isMemo: boolean;

  constructor(note: Note) {
    this.id = note.id;
    this.name = note.name;
    this.content = note.memo?.description || '';
    this.userId = note.userId;
    this.createdAt = new Date(note.createdAt);
    this.updatedAt = new Date(note.updatedAt);
    this.description = note.memo?.description || '';
    this.tags = note.tags;
    this.checkItems = note.checkItems;
    this.isMemo = note.memo !== null;
  }
} 