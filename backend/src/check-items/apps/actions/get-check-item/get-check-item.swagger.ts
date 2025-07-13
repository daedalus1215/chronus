import { CheckItemResponseDto } from "../../dtos/responses/check-item.response.dto";
import { ProtectedActionOptions } from "src/time-tracks/apps/decorators/protected-action.decorator";

export const GetCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Get a check item by ID',
  additionalResponses: [
    { 
      status: 200, 
      description: 'The check item has been successfully retrieved.',
      type: CheckItemResponseDto
    },
    {
      status: 404,
      description: 'Check item not found.'
    }
  ]     
};