import { Injectable } from "@nestjs/common";
import { UpdateNoteParams } from "./update-note.params";
import { Note } from "../../entities/notes/note.entity";
import { Memo } from "../../entities/notes/memo.entity";

@Injectable()
export class UpdateNoteParamsToEntityConverter {
  apply(updateNoteParams: UpdateNoteParams, note: Note): Note {
    return {
      ...note,
      name: updateNoteParams.name,
      memo: {
        ...(note.memo || new Memo()),
        description: updateNoteParams.description
      }
    };
  }
}

