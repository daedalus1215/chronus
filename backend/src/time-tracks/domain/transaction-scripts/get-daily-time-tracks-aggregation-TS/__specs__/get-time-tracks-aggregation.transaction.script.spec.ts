import { Test, TestingModule } from '@nestjs/testing';
import { GetDailyTimeTracksAggregationTransactionScript } from '../get-daily-time-tracks-aggregation.transaction.script';
import { TimeTrackRepository } from '../../../../infra/repositories/time-track.repository';

describe('GetDailyTimeTracksAggregationTransactionScript', () => {
  let target: GetDailyTimeTracksAggregationTransactionScript;
  let timeTrackRepository: jest.Mocked<TimeTrackRepository>;

  const mockTimeTrackRepository = {
    getDailyTimeTracksAggregation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDailyTimeTracksAggregationTransactionScript,
        {
          provide: TimeTrackRepository,
          useValue: mockTimeTrackRepository,
        },
      ],
    }).compile();

    target = module.get<GetDailyTimeTracksAggregationTransactionScript>(
      GetDailyTimeTracksAggregationTransactionScript
    );
    timeTrackRepository = module.get(TimeTrackRepository);
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

    it('should return aggregated time tracks without note titles', async () => {
      timeTrackRepository.getDailyTimeTracksAggregation.mockResolvedValue(
        mockAggregations
      );

      const result = await target.apply(mockCommand);

      expect(
        timeTrackRepository.getDailyTimeTracksAggregation
      ).toHaveBeenCalledWith(1, '2024-01-15');

      expect(result).toHaveLength(2);
      expect(result[0].noteId).toBe(1);
      expect(result[0].totalTimeMinutes).toBe(120);
      expect(result[0].dailyTimeMinutes).toBe(60);
      expect(result[1].noteId).toBe(2);
      expect(result[1].totalTimeMinutes).toBe(90);
      expect(result[1].dailyTimeMinutes).toBe(30);
    });

    it('should use current date when no date is provided', async () => {
      const commandWithoutDate = { user: { userId: 1, username: 'testuser' } };
      const today = new Date().toISOString().split('T')[0];

      timeTrackRepository.getDailyTimeTracksAggregation.mockResolvedValue([]);

      await target.apply(commandWithoutDate);

      expect(
        timeTrackRepository.getDailyTimeTracksAggregation
      ).toHaveBeenCalledWith(1, today);
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

      timeTrackRepository.getDailyTimeTracksAggregation.mockResolvedValue(
        mockAggregationsWithDifferentDates
      );

      const result = await target.apply(mockCommand);

      // Should be sorted by date (desc) then by time (desc)
      expect(result[0].noteId).toBe(2); // 2024-01-16
      expect(result[1].noteId).toBe(1); // 2024-01-15 14:30
      expect(result[2].noteId).toBe(3); // 2024-01-15 09:15
    });

    it('should return empty array when no aggregations found', async () => {
      timeTrackRepository.getDailyTimeTracksAggregation.mockResolvedValue([]);

      const result = await target.apply(mockCommand);

      expect(result).toEqual([]);
      expect(
        timeTrackRepository.getDailyTimeTracksAggregation
      ).toHaveBeenCalledWith(1, '2024-01-15');
    });
  });
});
