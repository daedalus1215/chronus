import { Injectable } from '@nestjs/common';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { Note } from 'src/notes/domain/entities/notes/note.entity';

@Injectable()
export class CreateNoteResponder {
  apply(note: Note): NoteResponseDto {
    return {
      id: note.id,
      name: note.name,
      checkItems: [],
      description: note.memo?.description || '',
      isMemo: note.memo !== null,
      folderId: note.folderId ?? null,
    };
  }
}
