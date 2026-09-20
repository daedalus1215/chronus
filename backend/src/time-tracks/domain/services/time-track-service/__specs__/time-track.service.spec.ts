import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TimeTrackService } from '../time-track.service';
import { CreateTimeTrackTransactionScript } from '../../../transaction-scripts/create-time-track-TS/create-time-track.transaction.script';
import { CreateTimeTrackCommand } from '../../../transaction-scripts/create-time-track-TS/create-time-track.command';
import { GetNoteTimeTracksTransactionScript } from '../../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.transaction.script';
import { GetNoteTimeTracksCommand } from '../../../transaction-scripts/get-note-time-tracks-TS/get-note-time-tracks.command';
import { GetTimeTracksTotalByNoteIdTransactionScript } from '../../../transaction-scripts/get-time-tracks-total-by-note-id-TS/get-time-tracks-total-by-note-id.transaction.script';
import { GetDailyTimeTracksAggregationTransactionScript } from '../../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.transaction.script';
import { GetDailyTimeTracksAggregationCommand } from '../../../transaction-scripts/get-daily-time-tracks-aggregation-TS/get-daily-time-tracks-aggregation.command';
import { GetWeeklyMostActiveNoteTransactionScript } from '../../../transaction-scripts/get-weekly-most-active-note-TS/get-weekly-most-active-note.transaction.script';
import { GetWeeklyTrendTransactionScript } from '../../../transaction-scripts/get-weekly-trend-TS/get-weekly-trend.transaction.script';
import { GetStreakTransactionScript } from '../../../transaction-scripts/get-streak-TS/get-streak.transaction.script';
import { GetNotesByYearTransactionScript } from '../../../transaction-scripts/get-notes-by-year-TS/get-notes-by-year.transaction.script';
import { GetTimeTracksByDateRangeTransactionScript } from '../../../transaction-scripts/get-time-tracks-by-date-range-TS/get-time-tracks-by-date-range.transaction.script';
import { UpdateTimeTrackNoteTransactionScript } from '../../../transaction-scripts/update-time-track-note-TS/update-time-track-note.transaction.script';
import { DeleteTimeTrackTransactionScript } from '../../../transaction-scripts/delete-time-track-TS/delete-time-track.transaction.script';
import { NoteAggregator } from '../../../../../notes/domain/aggregators/note.aggregator';
import { TagAggregator } from '../../../../../tags/domain/aggregators/tag.aggregator';
import { TimeTrack } from '../../../entities/time-track-entity/time-track.entity';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import {
  createMock,
  generateRandomNumbers,
} from 'src/shared-kernel/test-utils';

describe('TimeTrackService', () => {
  let target: TimeTrackService;

  let mockCreateTimeTrackTS: jest.Mocked<CreateTimeTrackTransactionScript>;
  let mockGetNoteTimeTracksTS: jest.Mocked<GetNoteTimeTracksTransactionScript>;
  let mockNoteAggregator: jest.Mocked<NoteAggregator>;
  let mockGetTimeTracksTotalByNoteIdTS: jest.Mocked<GetTimeTracksTotalByNoteIdTransactionScript>;
  let mockGetDailyTimeTracksAggregationTS: jest.Mocked<GetDailyTimeTracksAggregationTransactionScript>;
  let mockGetWeeklyMostActiveNoteTS: jest.Mocked<GetWeeklyMostActiveNoteTransactionScript>;
  let mockGetWeeklyTrendTS: jest.Mocked<GetWeeklyTrendTransactionScript>;
  let mockGetStreakTS: jest.Mocked<GetStreakTransactionScript>;
  let mockGetNotesByYearTS: jest.Mocked<GetNotesByYearTransactionScript>;
  let mockGetTimeTracksByDateRangeTS: jest.Mocked<GetTimeTracksByDateRangeTransactionScript>;
  let mockTagAggregator: jest.Mocked<TagAggregator>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let mockUpdateTimeTrackNoteTS: jest.Mocked<UpdateTimeTrackNoteTransactionScript>;
  let mockDeleteTimeTrackTS: jest.Mocked<DeleteTimeTrackTransactionScript>;

  const user: AuthUser = {
    userId: 42,
    username: 'cowboy',
  };

  beforeEach(async () => {
    mockCreateTimeTrackTS = createMock<CreateTimeTrackTransactionScript>({
      apply: jest.fn(),
    });
    mockGetNoteTimeTracksTS = createMock<GetNoteTimeTracksTransactionScript>({
      apply: jest.fn(),
    });
    mockNoteAggregator = createMock<NoteAggregator>({
      belongsToUser: jest.fn(),
      getNoteNamesByIds: jest.fn(),
    });
    mockGetTimeTracksTotalByNoteIdTS =
      createMock<GetTimeTracksTotalByNoteIdTransactionScript>({
        apply: jest.fn(),
      });
    mockGetDailyTimeTracksAggregationTS =
      createMock<GetDailyTimeTracksAggregationTransactionScript>({
        apply: jest.fn(),
      });
    mockGetWeeklyMostActiveNoteTS =
      createMock<GetWeeklyMostActiveNoteTransactionScript>({
        apply: jest.fn(),
      });
    mockGetWeeklyTrendTS = createMock<GetWeeklyTrendTransactionScript>({
      apply: jest.fn(),
    });
    mockGetStreakTS = createMock<GetStreakTransactionScript>({
      apply: jest.fn(),
    });
    mockGetNotesByYearTS = createMock<GetNotesByYearTransactionScript>({
      apply: jest.fn(),
    });
    mockGetTimeTracksByDateRangeTS =
      createMock<GetTimeTracksByDateRangeTransactionScript>({
        apply: jest.fn(),
      });
    mockTagAggregator = createMock<TagAggregator>();
    mockEventEmitter = createMock<EventEmitter2>();
    mockUpdateTimeTrackNoteTS =
      createMock<UpdateTimeTrackNoteTransactionScript>({
        apply: jest.fn(),
      });
    mockDeleteTimeTrackTS = createMock<DeleteTimeTrackTransactionScript>({
      apply: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TimeTrackService,
        {
          provide: CreateTimeTrackTransactionScript,
          useValue: mockCreateTimeTrackTS,
        },
        {
          provide: GetNoteTimeTracksTransactionScript,
          useValue: mockGetNoteTimeTracksTS,
        },
        {
          provide: NoteAggregator,
          useValue: mockNoteAggregator,
        },
        {
          provide: GetTimeTracksTotalByNoteIdTransactionScript,
          useValue: mockGetTimeTracksTotalByNoteIdTS,
        },
        {
          provide: GetDailyTimeTracksAggregationTransactionScript,
          useValue: mockGetDailyTimeTracksAggregationTS,
        },
        {
          provide: GetWeeklyMostActiveNoteTransactionScript,
          useValue: mockGetWeeklyMostActiveNoteTS,
        },
        {
          provide: GetWeeklyTrendTransactionScript,
          useValue: mockGetWeeklyTrendTS,
        },
        {
          provide: GetStreakTransactionScript,
          useValue: mockGetStreakTS,
        },
        {
          provide: GetNotesByYearTransactionScript,
          useValue: mockGetNotesByYearTS,
        },
        {
          provide: GetTimeTracksByDateRangeTransactionScript,
          useValue: mockGetTimeTracksByDateRangeTS,
        },
        {
          provide: TagAggregator,
          useValue: mockTagAggregator,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: UpdateTimeTrackNoteTransactionScript,
          useValue: mockUpdateTimeTrackNoteTS,
        },
        {
          provide: DeleteTimeTrackTransactionScript,
          useValue: mockDeleteTimeTrackTS,
        },
      ],
    }).compile();

    target = moduleRef.get(TimeTrackService);
  });

  describe('createTimeTrack', () => {
    it('rejects without delegating to the transaction script when the note does not belong to the user', async () => {
      // Arrange
      const command: CreateTimeTrackCommand = {
        noteId: 12,
        date: '2026-09-19',
        startTime: '09:30:00',
        durationMinutes: 45,
        user,
      };
      mockNoteAggregator.belongsToUser.mockRejectedValue(
        new Error('Note not found')
      );

      // Act
      // Assert
      await expect(target.createTimeTrack(command)).rejects.toThrow(
        'Note not found'
      );
      expect(mockNoteAggregator.belongsToUser).toHaveBeenCalledTimes(1);
      expect(mockNoteAggregator.belongsToUser).toHaveBeenCalledWith({
        noteId: 12,
        user: { id: 42 },
      });
      expect(mockCreateTimeTrackTS.apply).not.toHaveBeenCalled();
    });

    it('returns the projection of the saved time track when validation passes', async () => {
      // Arrange
      const command: CreateTimeTrackCommand = {
        noteId: 12,
        date: '2026-09-19',
        startTime: '09:30:00',
        durationMinutes: 45,
        user,
      };
      const createdAt = new Date('2026-09-19T09:30:00.000Z');
      const updatedAt = new Date('2026-09-19T09:30:00.000Z');
      const saved: TimeTrack = {
        id: 7,
        userId: 42,
        noteId: 12,
        date: '2026-09-19',
        startTime: '09:30:00',
        durationMinutes: 45,
        note: null,
        createdAt,
        updatedAt,
      };
      mockNoteAggregator.belongsToUser.mockResolvedValue(undefined);
      mockCreateTimeTrackTS.apply.mockResolvedValue(saved);

      // Act
      const result = await target.createTimeTrack(command);

      // Assert
      expect(result).toEqual({
        id: 7,
        userId: 42,
        noteId: 12,
        date: '2026-09-19',
        startTime: '09:30:00',
        durationMinutes: 45,
        note: null,
        createdAt,
        updatedAt,
      });
      expect(mockCreateTimeTrackTS.apply).toHaveBeenCalledWith(command);
    });
  });

  describe('getNoteTimeTracks', () => {
    it('rejects without delegating to the transaction script when the note does not belong to the user', async () => {
      // Arrange
      const command: GetNoteTimeTracksCommand = { noteId: 12, user };
      mockNoteAggregator.belongsToUser.mockRejectedValue(
        new Error('Note not found')
      );

      // Act
      // Assert
      await expect(target.getNoteTimeTracks(command)).rejects.toThrow(
        'Note not found'
      );
      expect(mockNoteAggregator.belongsToUser).toHaveBeenCalledWith({
        noteId: 12,
        user: { id: 42 },
      });
      expect(mockGetNoteTimeTracksTS.apply).not.toHaveBeenCalled();
    });

    it('delegates to GetNoteTimeTracksTransactionScript when the note belongs to the user', async () => {
      // Arrange
      const command: GetNoteTimeTracksCommand = { noteId: 12, user };
      const tsResult = [
        {
          id: 7,
          userId: 42,
          noteId: 12,
          date: '2026-09-19',
          startTime: '09:30:00',
          durationMinutes: 45,
          note: null,
          createdAt: new Date('2026-09-19T09:30:00.000Z'),
          updatedAt: new Date('2026-09-19T09:30:00.000Z'),
        },
      ];
      mockNoteAggregator.belongsToUser.mockResolvedValue(undefined);
      mockGetNoteTimeTracksTS.apply.mockResolvedValue(tsResult);

      // Act
      const result = await target.getNoteTimeTracks(command);

      // Assert
      expect(result).toEqual(tsResult);
      expect(mockGetNoteTimeTracksTS.apply).toHaveBeenCalledWith(command);
    });
  });

  describe('getNoteTimeTracksTotal', () => {
    it('rejects without delegating to the transaction script when the note does not belong to the user', async () => {
      // Arrange
      const command: GetNoteTimeTracksCommand = { noteId: 12, user };
      mockNoteAggregator.belongsToUser.mockRejectedValue(
        new Error('Note not found')
      );

      // Act
      // Assert
      await expect(target.getNoteTimeTracksTotal(command)).rejects.toThrow(
        'Note not found'
      );
      expect(mockNoteAggregator.belongsToUser).toHaveBeenCalledWith({
        noteId: 12,
        user: { id: 42 },
      });
      expect(mockGetTimeTracksTotalByNoteIdTS.apply).not.toHaveBeenCalled();
    });

    it('delegates to GetTimeTracksTotalByNoteIdTransactionScript when the note belongs to the user', async () => {
      // Arrange
      const command: GetNoteTimeTracksCommand = { noteId: 12, user };
      const tsResult = {
        totalMinutes: 90,
        totalDays: 0,
        totalHours: 1,
        totalMinutesRemainder: 30,
      };
      mockNoteAggregator.belongsToUser.mockResolvedValue(undefined);
      mockGetTimeTracksTotalByNoteIdTS.apply.mockResolvedValue(tsResult);

      // Act
      const result = await target.getNoteTimeTracksTotal(command);

      // Assert
      expect(result).toEqual(tsResult);
      expect(mockGetTimeTracksTotalByNoteIdTS.apply).toHaveBeenCalledWith(
        command
      );
    });
  });

  describe('deleteTimeTrack', () => {
    it('delegates to DeleteTimeTrackTransactionScript with (id, userId) and returns nothing', async () => {
      // Arrange
      mockDeleteTimeTrackTS.apply.mockResolvedValue(undefined);

      // Act
      const result = await target.deleteTimeTrack(7, 42);

      // Assert
      expect(result).toBeUndefined();
      expect(mockDeleteTimeTrackTS.apply).toHaveBeenCalledWith(7, 42);
      expect(mockDeleteTimeTrackTS.apply).toHaveBeenCalledTimes(1);
      expect(mockNoteAggregator.belongsToUser).not.toHaveBeenCalled();
    });
  });

  describe('getDailyTimeTracksAggregation', () => {
    it('composes the transaction script result with the note names for the user', async () => {
      // Arrange
      const command: GetDailyTimeTracksAggregationCommand = {
        user,
        date: '2026-09-19',
      };
      const tsResult = [
        {
          noteId: 11,
          totalTimeMinutes: 90,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '14:00:00',
          mostRecentDate: '2026-09-19',
        },
        {
          noteId: 11,
          totalTimeMinutes: 90,
          dailyTimeMinutes: 30,
          mostRecentStartTime: '09:30:00',
          mostRecentDate: '2026-09-19',
        },
        {
          noteId: 22,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 45,
          mostRecentStartTime: '16:15:00',
          mostRecentDate: '2026-09-18',
        },
      ];
      const noteNames = [
        { id: 11, name: 'First Note' },
        { id: 22, name: 'Second Note' },
      ];
      mockGetDailyTimeTracksAggregationTS.apply.mockResolvedValue(tsResult);
      mockNoteAggregator.getNoteNamesByIds.mockResolvedValue(noteNames);

      // Act
      const result = await target.getDailyTimeTracksAggregation(command);

      // Assert
      expect(result).toEqual({ trackTimeTracks: tsResult, noteNames });
      expect(mockGetDailyTimeTracksAggregationTS.apply).toHaveBeenCalledWith(
        command
      );
      expect(mockNoteAggregator.getNoteNamesByIds).toHaveBeenCalledWith(
        [11, 11, 22],
        42
      );
    });

    it('passes an empty note id list when there are no aggregations', async () => {
      // Arrange
      const command: GetDailyTimeTracksAggregationCommand = {
        user,
        date: '2026-09-19',
      };
      mockGetDailyTimeTracksAggregationTS.apply.mockResolvedValue([]);
      mockNoteAggregator.getNoteNamesByIds.mockResolvedValue([]);

      // Act
      const result = await target.getDailyTimeTracksAggregation(command);

      // Assert
      expect(result).toEqual({ trackTimeTracks: [], noteNames: [] });
      expect(mockNoteAggregator.getNoteNamesByIds).toHaveBeenCalledWith([], 42);
    });
  });
});
