import { NoteResponseDto } from "../../dtos/responses/note.response.dto";
import { ProtectedActionOptions } from "src/shared-kernel/apps/decorators/protected-action.decorator";

export const ArchiveNoteSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Archive a note',
  additionalResponses: [
    { 
      status: 200, 
      description: 'The note has been successfully archived.',
      type: NoteResponseDto
    },
    {
      status: 404,
      description: 'Note not found.'
    },
    {
      status: 403,
      description: 'Forbidden - User does not have permission to archive this note.'
    }
  ]     
};