import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const AddTagToNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Add a tag to a note',
  additionalResponses: [
    {
      status: 200,
      description: 'Tag added to note successfully.',
      type: NoteResponseDto,
    },
    {
      status: 404,
      description: 'Note or tag not found.',
    },
    {
      status: 400,
      description: 'Invalid request body.',
    },
  ],
}; 