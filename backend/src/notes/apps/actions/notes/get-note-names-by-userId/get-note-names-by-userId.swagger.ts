import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ApiQuery } from '@nestjs/swagger';

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

export const GetNoteNamesByUserIdApiQueries = [
  ApiQuery({
    name: 'type',
    required: false,
    description: "Filter by note type: 'memo' for memos, 'checkList' for checklists, or omit for all.",
    enum: ['memo', 'checkList'],
    type: String
  }),
  ApiQuery({
    name: 'query',
    required: false,
    description: 'Search by note name',
    type: String
  }),
  ApiQuery({
    name: 'tagId',
    required: false,
    description: 'Filter notes by tag ID',
    type: String
  })
]; 