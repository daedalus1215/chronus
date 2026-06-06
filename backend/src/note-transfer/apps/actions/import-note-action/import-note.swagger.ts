import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const ImportNoteSwagger: ProtectedActionOptions = {
  tag: 'Note Transfer',
  summary: 'Import a memo from a .chronus file',
  additionalResponses: [
    {
      status: 201,
      description: 'Returns the ID of the newly created note',
    },
    {
      status: 400,
      description: 'Invalid payload or unsupported version',
    },
  ],
};
