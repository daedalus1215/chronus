import { NoteResponseDto } from '../../../dtos/responses/note.response.dto';
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';

export const CreateNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Create a new note',
  additionalResponses: [
    {
      status: 201,
      description: 'The note has been successfully created.',
      type: NoteResponseDto,
    },
    {
      status: 400,
      description: 'Bad request.',
    },
  ],
};
