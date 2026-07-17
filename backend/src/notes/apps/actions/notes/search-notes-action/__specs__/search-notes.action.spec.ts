import { Test, TestingModule } from '@nestjs/testing';
import { SearchNotesAction, SearchNotesOptions } from '../search-notes.action';
import { NoteService } from 'src/notes/domain/services/note.service';
import { SearchNotesResponder } from '../search-notes.responder';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

describe('SearchNotesAction', () => {
  let action: SearchNotesAction;
  let mockNoteService: jest.Mocked<NoteService>;
  let mockResponder: jest.Mocked<SearchNotesResponder>;

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
    };
    const mockResp = {
      apply: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchNotesAction,
        { provide: NoteService, useValue: mockService },
        { provide: SearchNotesResponder, useValue: mockResp },
      ],
    }).compile();

    action = module.get<SearchNotesAction>(SearchNotesAction);
    mockNoteService = module.get(NoteService);
    mockResponder = module.get(SearchNotesResponder);
  });

  describe('apply', () => {
    it('should return empty array when query is missing', async () => {
      const result = await action.apply(1, undefined, undefined, undefined);
      expect(result).toEqual([]);
      expect(mockNoteService.search).not.toHaveBeenCalled();
    });

    it('should return empty array when query is too short', async () => {
      const result = await action.apply(1, 'x', undefined, undefined);
      expect(result).toEqual([]);
      expect(mockNoteService.search).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        action.apply(1, 'test', undefined, 'invalid_status')
      ).rejects.toThrow('Invalid status value');
    });

    it('should pass includeArchived=true when set', async () => {
      mockNoteService.search.mockResolvedValue({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [],
      });
      mockResponder.apply.mockReturnValue([]);

      await action.apply(1, 'test', 'true', undefined);

      expect(mockNoteService.search).toHaveBeenCalledWith(1, 'test', {
        includeArchived: true,
      });
    });

    it('should not pass includeArchived when false or undefined', async () => {
      mockNoteService.search.mockResolvedValue({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [],
      });
      mockResponder.apply.mockReturnValue([]);

      await action.apply(1, 'test', 'false', undefined);

      expect(mockNoteService.search).toHaveBeenCalledWith(1, 'test', {});
    });

    it('should pass status filter when provided', async () => {
      mockNoteService.search.mockResolvedValue({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [],
      });
      mockResponder.apply.mockReturnValue([]);

      await action.apply(1, 'test', undefined, 'done');

      expect(mockNoteService.search).toHaveBeenCalledWith(1, 'test', {
        status: 'done',
      });
    });

    it('should pass both includeArchived and status when both provided', async () => {
      mockNoteService.search.mockResolvedValue({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [],
      });
      mockResponder.apply.mockReturnValue([]);

      await action.apply(1, 'test', 'true', 'done');

      expect(mockNoteService.search).toHaveBeenCalledWith(1, 'test', {
        includeArchived: true,
        status: 'done',
      });
    });

    it('should trim whitespace from query', async () => {
      mockNoteService.search.mockResolvedValue({
        query: 'test',
        noteNameMatches: [],
        memoMatches: [],
        checkItemMatches: [],
      });
      mockResponder.apply.mockReturnValue([]);

      await action.apply(1, '  test  ', undefined, undefined);

      expect(mockNoteService.search).toHaveBeenCalledWith(1, 'test', {});
    });
  });

  describe('valid status values', () => {
    const validStatuses = ['ready', 'in_progress', 'review', 'done'];

    it.each(validStatuses)(
      'should accept status "%s" without throwing',
      async (status) => {
        mockNoteService.search.mockResolvedValue({
          query: 'test',
          noteNameMatches: [],
          memoMatches: [],
          checkItemMatches: [],
        });
        mockResponder.apply.mockReturnValue([]);

        await expect(
          action.apply(1, 'test', undefined, status)
        ).resolves.not.toThrow();
      }
    );
  });
});
