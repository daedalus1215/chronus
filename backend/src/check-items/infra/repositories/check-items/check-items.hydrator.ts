import { Injectable } from '@nestjs/common';
import { CheckItem } from '../../../domain/entities/check-item.entity';

type RawCheckItemResult = {
  id: number;
  name: string;
  done_date: Date | null;
  archived_date: Date | null;
  note_id: number;
  order: number | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class CheckItemsHydrator {
  fromRawResult(rawResult: RawCheckItemResult): CheckItem {
    const checkItem = new CheckItem();
    checkItem.id = rawResult.id;
    checkItem.name = rawResult.name;
    checkItem.doneDate = rawResult.done_date;
    checkItem.archiveDate = rawResult.archived_date;
    checkItem.noteId = rawResult.note_id;
    checkItem.order = rawResult.order ?? 0;
    checkItem.createdAt = rawResult.created_at;
    checkItem.updatedAt = rawResult.updated_at;
    return checkItem;
  }

  fromRawResults(rawResults: RawCheckItemResult[]): CheckItem[] {
    return rawResults.map(result => this.fromRawResult(result));
  }
}
