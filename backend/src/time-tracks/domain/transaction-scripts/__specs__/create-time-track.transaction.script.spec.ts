import { Test, TestingModule } from '@nestjs/testing';
import { CreateTimeTrackTransactionScript } from '../create-time-track.transaction.script';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { BadRequestException } from '@nestjs/common';

describe('CreateTimeTrackTransactionScript', () => {
  let target: CreateTimeTrackTransactionScript;
  let mockTimeTrackRepository: jest.Mocked<TimeTrackRepository>;

  const mockUser = { userId: 1, username: 'testuser' };
  const mockTimeTrack = {
    id: 1,
    userId: 1,
    noteId: 1,
    date: '2024-01-15',
    startTime: '09:00',
    durationMinutes: 30,
    note: 'Test note',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTimeTrackTransactionScript,
        {
          provide: TimeTrackRepository,
          useValue: {
            create: jest.fn(),
            findOverlappingEntries: jest.fn(),
            getDailyTotal: jest.fn(),
          },
        },
      ],
    }).compile();

    target = module.get<CreateTimeTrackTransactionScript>(CreateTimeTrackTransactionScript);
    mockTimeTrackRepository = module.get(TimeTrackRepository);
  });

  describe('apply', () => {
    const validCommand = {
      noteId: 1,
      date: '2024-01-15',
      startTime: '09:00',
      durationMinutes: 30,
      note: 'Test note',
      user: mockUser
    };

    it('should create a time track successfully', async () => {
      mockTimeTrackRepository.findOverlappingEntries.mockResolvedValue([]);
      mockTimeTrackRepository.getDailyTotal.mockResolvedValue(0);
      mockTimeTrackRepository.create.mockResolvedValue(mockTimeTrack);

      const result = await target.apply(validCommand);

      expect(mockTimeTrackRepository.create).toHaveBeenCalledWith({
        ...validCommand,
        userId: validCommand.user.userId,
        date: validCommand.date
      });
      expect(result).toEqual({
        id: mockTimeTrack.id,
        userId: mockTimeTrack.userId,
        noteId: mockTimeTrack.noteId,
        date: mockTimeTrack.date,
        startTime: mockTimeTrack.startTime,
        durationMinutes: mockTimeTrack.durationMinutes,
        note: mockTimeTrack.note,
        createdAt: mockTimeTrack.createdAt,
        updatedAt: mockTimeTrack.updatedAt
      });
    });

    it('should throw BadRequestException for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureCommand = {
        ...validCommand,
        date: futureDate.toISOString().split('T')[0]
      };

      await expect(target.apply(futureCommand)).rejects.toThrow(BadRequestException);
      expect(mockTimeTrackRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid duration', async () => {
      const invalidDurationCommand = {
        ...validCommand,
        durationMinutes: 0
      };

      await expect(target.apply(invalidDurationCommand)).rejects.toThrow(BadRequestException);
      expect(mockTimeTrackRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for overlapping entries', async () => {
      mockTimeTrackRepository.findOverlappingEntries.mockResolvedValue([mockTimeTrack]);

      await expect(target.apply(validCommand)).rejects.toThrow(BadRequestException);
      expect(mockTimeTrackRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for daily limit exceeded', async () => {
      mockTimeTrackRepository.findOverlappingEntries.mockResolvedValue([]);
      mockTimeTrackRepository.getDailyTotal.mockResolvedValue(1440); // 24 hours

      await expect(target.apply(validCommand)).rejects.toThrow(BadRequestException);
      expect(mockTimeTrackRepository.create).not.toHaveBeenCalled();
    });
  });
}); 