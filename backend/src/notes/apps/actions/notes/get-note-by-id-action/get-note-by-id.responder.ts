import { Injectable } from '@nestjs/common';
import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { NoteWithCheckItems } from '../../../../domain/services/note.service';

@Injectable()
export class GetNoteByIdResponder {
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
