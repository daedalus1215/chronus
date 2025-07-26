import { Injectable } from "@nestjs/common";
import { NoteMemoTagRepository } from "../../infra/repositories/note-memo-tag.repository";

type NoteNameReference = {
  id: number;
  name: string;
};

@Injectable()
export class GetNoteNamesByIdsTransactionScript {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  async apply(noteIds: number[], userId: number): Promise<NoteNameReference[]> {
    return await this.noteRepository.getNoteNamesByIds(noteIds, userId);
  }
} 