import { TagResponseDto } from 'src/tags/app/dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const UpdateTagSwagger: ProtectedActionOptions = {
  tag: 'Tags',
  summary: 'Update a tag',
  additionalResponses: [
    {
      status: 200,
      description: 'Tag updated successfully.',
      type: TagResponseDto,
    },
    {
      status: 404,
      description: 'Tag not found.',
    },
    {
      status: 400,
      description: 'Invalid request body.',
    },
  ],
};

