import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateNoteDto } from "src/notes/apps/dtos/requests/create-note.dto";
import { Memo } from "src/notes/domain/entities/notes/memo.entity";
import { Note } from "src/notes/domain/entities/notes/note.entity";
import { NoteTagRepository } from "src/notes/infra/repositories/note-tag.repository";
import { Repository } from "typeorm";

@Injectable()
export class CreateNoteTransactionScript {
  constructor(
    @InjectRepository(Note)
    private noteTagRepository: NoteTagRepository,
    @InjectRepository(Memo)
    private memoRepository: Repository<Memo>
  ) {}

  async apply(createNoteDto: CreateNoteDto): Promise<Note> {
    const { name, userId, isMemo } = createNoteDto;

    const note = new Note();
    note.name = name;
    note.userId = userId;

    if (isMemo) {
      const memo = new Memo();
      memo.description = "";
      const savedMemo = await this.memoRepository.save(memo);
      note.memo = savedMemo;
    } else {
      throw Error("Checklist not implemented yet");
    }

    return this.noteTagRepository.save(note);
  }
}
