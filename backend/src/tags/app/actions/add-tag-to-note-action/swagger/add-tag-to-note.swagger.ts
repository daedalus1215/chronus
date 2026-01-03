import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { Tag } from 'src/tags/domain/entities/tag.entity';

export const AddTagToNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Add a tag to a note',
  additionalResponses: [
    {
      status: 200,
      description: 'Tag added to note successfully.',
      type: Tag,
    },
    {
      status: 404,
      description: 'Note or tag not found.',
    },
    {
      status: 400,
      description: 'Invalid request body.',
    },
  ],
}; 