import { CheckItemResponseDto } from "../../dtos/responses/check-item.response.dto";
import { ProtectedActionOptions } from "src/time-tracks/apps/decorators/protected-action.decorator";

export const CreateCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Create a new check item for a note',
  additionalResponses: [
    { 
      status: 201, 
      description: 'The check item has been successfully created.',
      type: CheckItemResponseDto
    },
    { 
      status: 400, 
      description: 'Bad request - Invalid input data.' 
    },
    {
      status: 404,
      description: 'Note not found - The specified note does not exist.'
    },
    {
      status: 403,
      description: 'Forbidden - User does not have permission to access this note.'
    }
  ]     
}; 