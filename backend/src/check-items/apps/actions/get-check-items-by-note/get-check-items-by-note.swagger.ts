import { CheckItemResponseDto } from '../../dtos/responses/check-item.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetCheckItemsByNoteSwagger: ProtectedActionOptions = {
  tag: 'Check Items',
  summary: 'Get all check items for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'The check items have been successfully retrieved.',
      type: [CheckItemResponseDto],
    },
    {
      status: 404,
      description: 'Note not found.',
    },
    {
      status: 403,
      description:
        'Forbidden - User does not have permission to access this note.',
    },
  ],
};
