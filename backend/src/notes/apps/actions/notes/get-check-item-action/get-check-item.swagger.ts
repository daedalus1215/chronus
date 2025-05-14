import { CheckItemResponseDto } from '../../../dtos/responses/check-item.response.dto';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const GetCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Get a check item by ID',
  additionalResponses: [
    { 
      status: 200, 
      description: 'Returns the check item.',
      type: CheckItemResponseDto
    },
    { 
      status: 404, 
      description: 'Check item not found.' 
    }
  ]
}; 