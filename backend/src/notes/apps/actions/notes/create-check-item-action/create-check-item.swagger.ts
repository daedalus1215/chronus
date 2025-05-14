import { CheckItem } from 'src/notes/domain/entities/notes/check-item.entity';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const CreateCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Create a new check item for a note',
  additionalResponses: [
    { 
      status: 201, 
      description: 'The check item has been successfully created.',
      type: CheckItem
    },
    { 
      status: 400, 
      description: 'Bad request.' 
    },
    {
      status: 404,
      description: 'Note not found.'
    }
  ]     
}; 