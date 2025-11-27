import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const DeleteTagSwagger: ProtectedActionOptions = {
  tag: 'Tags',
  summary: 'Delete a tag',
  additionalResponses: [
    {
      status: 200,
      description: 'Tag deleted successfully.',
    },
    {
      status: 404,
      description: 'Tag not found.',
    },
  ],
};

