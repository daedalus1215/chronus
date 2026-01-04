import { Test, TestingModule } from '@nestjs/testing';
import { CreateTimeTrackTransactionScript } from '../create-time-track.transaction.script';
import { TimeTrackRepository } from '../../../infra/repositories/time-track.repository';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('CreateTimeTrackTransactionScript', () => {
  let target: CreateTimeTrackTransactionScript;
  let mockTimeTrackRepository: jest.Mocked<TimeTrackRepository>;

  const mockUser = { userId: generateRandomNumbers(), username: 'testuser' };
  const mockTimeTrack = {
    id: generateRandomNumbers(),
    userId: generateRandomNumbers(),
    noteId: generateRandomNumbers(),
    date: '2024-01-15',
    startTime: '09:00',
    durationMinutes: 30,
    note: 'Test note',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTimeTrackTransactionScript,
        {
          provide: TimeTrackRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    target = module.get<CreateTimeTrackTransactionScript>(
      CreateTimeTrackTransactionScript
    );
    mockTimeTrackRepository = module.get(TimeTrackRepository);
  });

  describe('apply', () => {
    const validCommand = {
      noteId: generateRandomNumbers(),
      date: '2024-01-15',
      startTime: '09:00',
      durationMinutes: 30,
      note: 'Test note',
      user: mockUser,
    };

    it('should create a time track successfully', async () => {
      // Arrange
      mockTimeTrackRepository.create.mockResolvedValue(mockTimeTrack);

      // Act
      const result = await target.apply(validCommand);

      // Assert
      expect(result).toEqual(mockTimeTrack);
      expect(mockTimeTrackRepository.create).toHaveBeenCalledWith({
        ...validCommand,
        userId: validCommand.user.userId,
        date: validCommand.date,
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
        updatedAt: mockTimeTrack.updatedAt,
      });
    });
  });
});
