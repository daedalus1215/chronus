import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const MergeIntoNoteSwagger: ProtectedActionOptions = {
  tag: 'Note Transfer',
  summary: 'Merge imported content into an existing memo',
  additionalResponses: [
    {
      status: 200,
      description: 'Merge completed successfully',
    },
    {
      status: 404,
      description: 'Note not found',
    },
    {
      status: 403,
      description: 'Not authorized to access this note',
    },
    {
      status: 400,
      description: 'Invalid payload or unsupported version',
    },
  ],
};
