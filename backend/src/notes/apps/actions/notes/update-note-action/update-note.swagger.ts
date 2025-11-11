import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Update a note by ID',
  additionalResponses: [
    { 
      status: 200, 
      description: 'Note updated successfully.', 
      type: NoteResponseDto 
    },
    { 
      status: 404, 
      description: 'Note not found.' 
    },
    { 
      status: 400, 
      description: 'Invalid request body.' 
    }
  ]
}; 