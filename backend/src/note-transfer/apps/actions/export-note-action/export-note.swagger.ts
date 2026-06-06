import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const ExportNoteSwagger: ProtectedActionOptions = {
  tag: 'Note Transfer',
  summary: 'Export a memo to a .chronus file',
  additionalResponses: [
    {
      status: 200,
      description: 'Returns the .chronus file as a JSON download',
    },
    {
      status: 404,
      description: 'Note not found',
    },
    {
      status: 403,
      description: 'Not authorized to access this note',
    },
  ],
};
