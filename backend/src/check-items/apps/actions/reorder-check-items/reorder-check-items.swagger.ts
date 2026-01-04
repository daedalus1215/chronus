import { CheckItemResponseDto } from '../../dtos/responses/check-item.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const ReorderCheckItemsSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Reorder check items for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'The check items have been successfully reordered.',
      type: [CheckItemResponseDto],
    },
    {
      status: 404,
      description: 'One or more check items not found or access denied.',
    },
    {
      status: 403,
      description: 'Forbidden - All check items must belong to the same note.',
    },
  ],
};
