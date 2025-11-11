import { TagResponseDto } from 'src/tags/app/dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const CreateTagSwagger: ProtectedActionOptions = {
  tag: 'Tags',
  summary: 'Create a new tag',
  additionalResponses: [
    {
      status: 201,
      description: 'Tag created successfully.',
      type: TagResponseDto,
    },
    {
      status: 400,
      description: 'Invalid request body.',
    },
  ],
}; 