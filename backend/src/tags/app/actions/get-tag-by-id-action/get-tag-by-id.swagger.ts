import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetTagByIdSwagger: ProtectedActionOptions = {
  tag: 'Tags',
  summary: 'Get a tag by ID',
  additionalResponses: [
    {
      status: 200,
      description: 'Tag fetched successfully.',
      type: TagResponseDto,
    },
    {
      status: 404,
      description: 'Tag not found.',
    },
  ],
};

