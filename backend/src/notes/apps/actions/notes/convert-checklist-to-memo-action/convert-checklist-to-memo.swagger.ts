import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const ConvertChecklistToMemoSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Convert a checklist note to a memo note',
  additionalResponses: [
    {
      status: 200,
      description:
        'Note converted successfully. Check items become the sidebar checklist.',
      type: NoteResponseDto,
    },
    {
      status: 404,
      description: 'Note not found.',
    },
    {
      status: 400,
      description: 'Note is already a memo note.',
    },
    {
      status: 403,
      description:
        'Forbidden - User does not have permission to convert this note.',
    },
  ],
};
