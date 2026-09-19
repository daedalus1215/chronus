import { TagResponseDto } from '../../dtos/responses/tag.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const GetTagsByNoteIdSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Get all tags for a note',
  additionalResponses: [
    {
      status: 200,
      description: 'Tags fetched successfully.',
      type: TagResponseDto,
    },
    {
      status: 404,
      description: 'No tags found for this note or note not found.',
    },
  ],
};
