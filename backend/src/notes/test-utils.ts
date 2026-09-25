import { UpdateNoteDto } from './apps/dtos/requests/update-note.dto';
import { Note } from './domain/entities/notes/note.entity';

export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  name: 'Original Note',
  userId: 1,
  archivedAt: null,
  folderId: null,
  sortOrder: 0,
  pinned: false,
  pinnedAt: null,
  memo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUpdateNoteDto = (
  overrides: Partial<UpdateNoteDto> = {}
): UpdateNoteDto => ({
  name: 'Updated Note',
  description: 'Updated Description',
  tags: [],
  ...overrides,
});
