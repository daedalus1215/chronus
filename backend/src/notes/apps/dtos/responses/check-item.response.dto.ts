import { CheckItemProjection } from 'src/check-items/domain/aggregators/check-items.aggregator';

//@TODO We need to remove constructor conversion and move towards a separate class that does the conversion. 
export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  createdAt: string;
  updatedAt: string;

  constructor(checkItem: CheckItemProjection) {
    this.id = checkItem.id;
    this.name = checkItem.name;
    this.doneDate = checkItem.doneDate;
    this.archiveDate = checkItem.archiveDate;
    this.noteId = checkItem.noteId;
    this.createdAt = checkItem.createdAt;
    this.updatedAt = checkItem.updatedAt;
  }
} 