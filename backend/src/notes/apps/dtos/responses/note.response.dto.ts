import { ApiProperty } from '@nestjs/swagger';
import { Note } from '../../../domain/entities/notes/note.entity';
import { CheckItemProjection } from 'src/check-items/domain/aggregators/check-items.aggregator';

export class NoteResponseDto {
  @ApiProperty()
  id: Note['id'];

  @ApiProperty()
  name: Note['name'];

  @ApiProperty()
  checkItems: CheckItemProjection[];

  @ApiProperty()
  isMemo: boolean;

  @ApiProperty()
  description?: string;
}