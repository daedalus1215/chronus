import { NoteResponseDto } from '../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const PinNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Pin or unpin a note',
  additionalResponses: [
    {
      status: 200,
      description: 'The note pin state has been updated.',
      type: NoteResponseDto,
    },
    {
      status: 404,
      description: 'Note not found.',
    },
  ],
};
