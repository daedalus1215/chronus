import { CheckItemResponseDto } from '../../dtos/responses/check-item.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateCheckItemStatusSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Update a check item status',
  additionalResponses: [
    {
      status: 200,
      description: 'The check item status has been successfully updated.',
      type: CheckItemResponseDto,
    },
    {
      status: 404,
      description: 'Check item not found.',
    },
  ],
};
