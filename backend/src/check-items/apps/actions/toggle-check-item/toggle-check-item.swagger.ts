import { CheckItemResponseDto } from "../../dtos/responses/check-item.response.dto";
import { ProtectedActionOptions } from "src/shared-kernel/apps/decorators/protected-action.decorator";

export const ToggleCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Toggle a check item completion status',
  additionalResponses: [
    { 
      status: 200, 
      description: 'The check item has been successfully toggled.',
      type: CheckItemResponseDto
    },
    {
      status: 404,
      description: 'Check item not found.'
    }
  ]     
};