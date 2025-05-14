import { CheckItemResponseDto } from '../../../dtos/responses/check-item.response.dto';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

export const ToggleCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Toggle a check item\'s done status',
  additionalResponses: [
    { 
      status: 200, 
      description: 'The check item has been toggled successfully.',
      type: CheckItemResponseDto
    },
    { 
      status: 404, 
      description: 'Check item not found.' 
    }
  ]
}; 