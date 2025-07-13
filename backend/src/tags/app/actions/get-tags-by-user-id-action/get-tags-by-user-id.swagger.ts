import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetTagsByUserIdSwagger: ProtectedActionOptions = {
  tag: 'Tags',
  summary: 'Get all tags for the authenticated user',
  additionalResponses: [
    {
      status: 200,
      description: 'Tags fetched successfully.',
      type: TagResponseDto,
    },
    {
      status: 401,
      description: 'Unauthorized.',
    },
  ],
}; 