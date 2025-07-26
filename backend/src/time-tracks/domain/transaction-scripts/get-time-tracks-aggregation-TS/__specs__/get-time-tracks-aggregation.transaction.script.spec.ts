import { Test, TestingModule } from '@nestjs/testing';
import { GetTimeTracksAggregationTransactionScript } from '../get-time-tracks-aggregation.transaction.script';
import { TimeTrackRepository } from '../../../../infra/repositories/time-track.repository';
import { NoteAggregator } from '../../../../../notes/domain/aggregators/note.aggregator';
import { TimeTrackAggregationResponseDto } from '../../../../apps/dtos/responses/time-track-aggregation.response.dto';

describe('GetTimeTracksAggregationTransactionScript', () => {
  let target: GetTimeTracksAggregationTransactionScript;
  let timeTrackRepository: jest.Mocked<TimeTrackRepository>;
  let noteAggregator: jest.Mocked<NoteAggregator>;

  const mockTimeTrackRepository = {
    getTimeTracksAggregation: jest.fn(),
  };

  const mockNoteAggregator = {
    getReference: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTimeTracksAggregationTransactionScript,
        {
          provide: TimeTrackRepository,
          useValue: mockTimeTrackRepository,
        },
        {
          provide: NoteAggregator,
          useValue: mockNoteAggregator,
        },
      ],
    }).compile();

    target = module.get<GetTimeTracksAggregationTransactionScript>(GetTimeTracksAggregationTransactionScript);
    timeTrackRepository = module.get(TimeTrackRepository);
    noteAggregator = module.get(NoteAggregator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    const mockCommand = {
      user: { userId: 1, username: 'testuser' },
      date: '2024-01-15',
    };

    const mockAggregations = [
      {
        noteId: 1,
        totalTimeMinutes: 120,
        dailyTimeMinutes: 60,
        mostRecentStartTime: '14:30',
        mostRecentDate: '2024-01-15',
      },
      {
        noteId: 2,
        totalTimeMinutes: 90,
        dailyTimeMinutes: 30,
        mostRecentStartTime: '10:15',
        mostRecentDate: '2024-01-15',
      },
    ];

    const mockNoteReferences = [
      { id: 1, name: 'Note 1', userId: 1 },
      { id: 2, name: 'Note 2', userId: 1 },
    ];

    it('should return aggregated time tracks with note titles', async () => {
      timeTrackRepository.getTimeTracksAggregation.mockResolvedValue(mockAggregations);
      noteAggregator.getReference
        .mockResolvedValueOnce(mockNoteReferences[0])
        .mockResolvedValueOnce(mockNoteReferences[1]);

      const result = await target.apply(mockCommand);

      expect(timeTrackRepository.getTimeTracksAggregation).toHaveBeenCalledWith(1, '2024-01-15');
      expect(noteAggregator.getReference).toHaveBeenCalledWith(1, 1);
      expect(noteAggregator.getReference).toHaveBeenCalledWith(2, 1);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(TimeTrackAggregationResponseDto);
      expect(result[0].noteId).toBe(1);
      expect(result[0].noteTitle).toBe('Note 1');
      expect(result[0].totalTimeMinutes).toBe(120);
      expect(result[0].dailyTimeMinutes).toBe(60);
      expect(result[1].noteId).toBe(2);
      expect(result[1].noteTitle).toBe('Note 2');
      expect(result[1].totalTimeMinutes).toBe(90);
      expect(result[1].dailyTimeMinutes).toBe(30);
    });

    it('should use current date when no date is provided', async () => {
      const commandWithoutDate = { user: { userId: 1, username: 'testuser' } };
      const today = new Date().toISOString().split('T')[0];
      
      timeTrackRepository.getTimeTracksAggregation.mockResolvedValue([]);

      await target.apply(commandWithoutDate);

      expect(timeTrackRepository.getTimeTracksAggregation).toHaveBeenCalledWith(1, today);
    });

    it('should sort results by most recent date and time', async () => {
      const mockAggregationsWithDifferentDates = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '14:30',
          mostRecentDate: '2024-01-15',
        },
        {
          noteId: 2,
          totalTimeMinutes: 90,
          dailyTimeMinutes: 30,
          mostRecentStartTime: '16:45',
          mostRecentDate: '2024-01-16',
        },
        {
          noteId: 3,
          totalTimeMinutes: 75,
          dailyTimeMinutes: 45,
          mostRecentStartTime: '09:15',
          mostRecentDate: '2024-01-15',
        },
      ];

      timeTrackRepository.getTimeTracksAggregation.mockResolvedValue(mockAggregationsWithDifferentDates);
      noteAggregator.getReference
        .mockResolvedValueOnce({ id: 1, name: 'Note 1', userId: 1 })
        .mockResolvedValueOnce({ id: 2, name: 'Note 2', userId: 1 })
        .mockResolvedValueOnce({ id: 3, name: 'Note 3', userId: 1 });

      const result = await target.apply(mockCommand);

      // Should be sorted by date (desc) then by time (desc)
      expect(result[0].noteId).toBe(2); // 2024-01-16
      expect(result[1].noteId).toBe(1); // 2024-01-15 14:30
      expect(result[2].noteId).toBe(3); // 2024-01-15 09:15
    });

    it('should return empty array when no aggregations found', async () => {
      timeTrackRepository.getTimeTracksAggregation.mockResolvedValue([]);

      const result = await target.apply(mockCommand);

      expect(result).toEqual([]);
      expect(timeTrackRepository.getTimeTracksAggregation).toHaveBeenCalledWith(1, '2024-01-15');
    });
  });
}); 