import { Injectable } from '@nestjs/common';
import { NoteWithCheckItems } from '../../../../domain/services/note.service';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';

@Injectable()
export class LoadNoteVersionResponder {
  apply(input: NoteWithCheckItems): NoteResponseDto {
    const { note, checkItems } = input;
    return {
      id: note.id,
      name: note.name,
      checkItems,
      description: note.memo?.description || '',
      isMemo: note.memo !== null,
    };
  }
}
