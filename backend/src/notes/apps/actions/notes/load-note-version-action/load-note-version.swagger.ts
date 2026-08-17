import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const LoadNoteVersionSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Load a note version (set note description to version content)',
  additionalResponses: [
    {
      status: 200,
      description: 'Returns the updated note.',
      type: NoteResponseDto,
    },
    {
      status: 404,
      description: 'Version not found.',
    },
  ],
};
