import { ProtectedActionOptions } from 'src/shared-kernel/decorators/protected-action.decorator';

type NoteNameResponse = {
  id: number;
  name: string;
}

export const GetNoteNamesByUserIdSwagger: ProtectedActionOptions = {
  tag: 'Notes',
  summary: 'Get all note names for the authenticated user',
  additionalResponses: [
    {
      status: 200,
      description: 'Returns a list of note names and IDs.',
      type: Array<NoteNameResponse>
    }
  ]
}; 