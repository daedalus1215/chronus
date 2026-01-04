import { NoteMemoTagRepository } from '../infra/repositories/note-memo-tag.repository';
import { UpdateNoteParamsToEntityConverter } from '../domain/transaction-scripts/update-note-TS/update-note-params-to-entity.converter';
import { Note } from '../domain/entities/notes/note.entity';
import { UpdateNoteDto } from '../apps/dtos/requests/update-note.dto';
import { Repository } from 'typeorm';
import { Memo } from '../domain/entities/notes/memo.entity';

// Local mock type for Tag - avoids cross-domain import
type MockTag = {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export const createMock = <T>(overrides: Partial<T> = {}): jest.Mocked<T> =>
  overrides as unknown as jest.Mocked<T>;

export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  name: 'Original Note',
  userId: 1,
  archivedAt: null,
  memo: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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

export const createMockTypeormRepository = <T>(): jest.Mocked<Repository<T>> =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    // Add other Repository methods as needed
  }) as unknown as jest.Mocked<Repository<T>>;

export const createMockRepository = (): jest.Mocked<NoteMemoTagRepository> => {
  const repository = createMockTypeormRepository<Note>();
  const tagRepository = createMockTypeormRepository<MockTag>();
  const memoRepository = createMockTypeormRepository<Memo>();

  return {
    repository,
    tagRepository,
    memoRepository,
    findById: jest.fn(),
    save: jest.fn(),
    findTagByName: jest.fn(),
    createTag: jest.fn(),
    removeTag: jest.fn(),
    getNoteNamesByUserId: jest.fn(),
  } as unknown as jest.Mocked<NoteMemoTagRepository>;
};

export const createMockConverter =
  (): jest.Mocked<UpdateNoteParamsToEntityConverter> => ({
    apply: jest.fn(),
  });
