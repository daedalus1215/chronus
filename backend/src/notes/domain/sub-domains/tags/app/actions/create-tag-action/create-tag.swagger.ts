import { TagResponseDto } from 'src/notes/apps/dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/time-tracks/apps/decorators/protected-action.decorator';

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