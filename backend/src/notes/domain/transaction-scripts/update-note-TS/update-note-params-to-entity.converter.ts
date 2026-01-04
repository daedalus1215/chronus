import { Injectable } from '@nestjs/common';
import { UpdateNoteParams } from './update-note.params';
import { Note } from '../../entities/notes/note.entity';
import { Memo } from '../../entities/notes/memo.entity';

@Injectable()
export class UpdateNoteParamsToEntityConverter {
  apply(updateNoteParams: UpdateNoteParams, note: Note): Note {
    const updatedNote: Note = {
      ...note,
      name: updateNoteParams.name,
    };

    // Handle memo/description update
    if (updateNoteParams.description !== undefined) {
      if (note.memo) {
        // Update existing memo
        updatedNote.memo = {
          ...note.memo,
          description: updateNoteParams.description,
        };
      } else {
        // Create new memo if description is provided
        const newMemo = new Memo();
        newMemo.description = updateNoteParams.description;
        updatedNote.memo = newMemo;
      }
    }

    return updatedNote;
  }
}
