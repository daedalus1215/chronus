import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';

//@TODO We need to remove constructor conversion and move towards a separate class that does the conversion. 
export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date;
  archiveDate: Date;
  noteId: number;
  createdAt: string;
  updatedAt: string;

  constructor(checkItem: CheckItem) {
    this.id = checkItem.id;
    this.name = checkItem.name;
    this.doneDate = checkItem.doneDate;
    this.archiveDate = checkItem.archiveDate;
    this.noteId = checkItem.noteId;
    this.createdAt = checkItem.createdAt;
    this.updatedAt = checkItem.updatedAt;
  }
} 