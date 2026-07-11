import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const MergeNotesSwagger: ProtectedActionOptions = {
  tag: 'Note Transfer',
  summary:
    'Merge multiple notes into a target note. Descriptions appended with headings, check items merged, tags unioned, sources archived, audio deleted.',
  additionalResponses: [
    {
      status: 200,
      description: 'Notes merged successfully',
    },
    {
      status: 404,
      description: 'Target or source note not found',
    },
    {
      status: 400,
      description:
        'Invalid request - version mismatch, or description too long',
    },
  ],
};
