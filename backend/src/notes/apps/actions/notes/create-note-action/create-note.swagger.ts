import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const CreateNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Create a new note',
  additionalResponses: [
    { 
      status: 201, 
      description: 'The note has been successfully created.',
      type: Note
    },
    { 
      status: 400, 
      description: 'Bad request.' 
    }
  ]
}; 