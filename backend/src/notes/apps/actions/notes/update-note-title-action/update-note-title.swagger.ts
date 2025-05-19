import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const UpdateNoteTitleSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Update a note title by ID',
  additionalResponses: [
    {
      status: 200,
      description: 'Note title updated successfully.',
      type: NoteResponseDto,
    },
    {
      status: 404,
      description: 'Note not found.',
    },
    {
      status: 400,
      description: 'Invalid request body.',
    },
  ],
}; 