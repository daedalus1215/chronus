import { Injectable, NotFoundException } from "@nestjs/common";
import { NoteMemoTagRepository } from "../../infra/repositories/note-memo-tag.repository";
import { NoteResponseDto } from "src/notes/apps/dtos/responses/note.response.dto";
import { CheckItem } from "../entities/notes/check-item.entity";
import { Memo } from "../entities/notes/memo.entity";

@Injectable()
export class GetNoteByIdTransactionScript {
  constructor(private readonly noteTagRepository: NoteMemoTagRepository) {}

  async apply(
    id: number,
    userId: string
  ): Promise<{
    id: number;
    name: string;
    memo?: Memo;
    checkItems: CheckItem[];
  }> {
    const note = await this.noteTagRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    //@TODO: This is used in two spots now
    const nonArchivedCheckItems = note.checkItems
      .filter((checkItem) => checkItem.doneDate == null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const archivedCheckItems = note.checkItems
      .filter((checkItem) => checkItem.doneDate !== null)
      .sort(
        (a, b) =>
          new Date(a.doneDate).getTime() - new Date(b.archiveDate).getTime()
      );
    
    return {
      ...note,
      checkItems: [...nonArchivedCheckItems, ...archivedCheckItems],
    };
  }
}
