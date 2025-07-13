import { ProtectedActionOptions } from "src/shared-kernel/apps/decorators/protected-action.decorator";

export const DeleteCheckItemSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Delete a check item',
  additionalResponses: [
    { 
      status: 200, 
      description: 'The check item has been successfully deleted.'
    },
    {
      status: 404,
      description: 'Check item not found.'
    }
  ]     
};