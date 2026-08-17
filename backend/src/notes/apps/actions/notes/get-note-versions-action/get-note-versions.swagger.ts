import { NoteVersionResponseDto } from '../../../dtos/responses/note-version.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetNoteVersionsSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Get all versions for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'Returns version list and total count.',
      type: {
        versions: [NoteVersionResponseDto],
        total: Number,
      },
    },
    {
      status: 404,
      description: 'Note not found.',
    },
  ],
};
