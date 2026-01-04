import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { RemoveTagFromNoteDto } from '../dtos/requests/remove-tag-from-note.dto';

export const RemoveTagFromNoteSwagger: ProtectedActionOptions = {
  tag: 'tags',
  summary: 'Remove a tag from a note',
  additionalResponses: [
    {
      status: 404,
      description: 'Tag-note association not found',
      type: RemoveTagFromNoteDto,
    },
  ],
};
