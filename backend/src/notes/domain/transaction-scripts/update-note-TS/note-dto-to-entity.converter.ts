import { Injectable } from "@nestjs/common";
import { UpdateNoteDto } from "src/notes/apps/dtos/requests/update-note.dto";
import { Note } from "../../entities/notes/note.entity";
import { Memo } from "../../entities/notes/memo.entity";

//@TODO: Move dto conversions in the app layer
@Injectable()
export class NoteDtoToEntityConverter {
    apply(updateNoteDto: UpdateNoteDto, note: Note):Note   {
       return {
        ...note,
        name: updateNoteDto.name,
        memo: {
          ...(note.memo || new Memo()),
          description: updateNoteDto.description
        }
      }
    }
}