import { Test } from '@nestjs/testing';
import { UpdatePlaybackPositionTransactionScript } from '../update-playback-position.transaction.script';
import { NoteAudioRepository } from '../../../../infrastructure/repositories/note-audio.repository';
import {
  generateRandomNumbers,
  createMock,
} from 'src/shared-kernel/test-utils';

describe('UpdatePlaybackPositionTransactionScript', () => {
  let target: UpdatePlaybackPositionTransactionScript;
  let mockNoteAudioRepository: jest.Mocked<NoteAudioRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockNoteAudioRepository = createMock<NoteAudioRepository>({
      updatePositionById: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdatePlaybackPositionTransactionScript,
        {
          provide: NoteAudioRepository,
          useValue: mockNoteAudioRepository,
        },
      ],
    }).compile();

    target = moduleRef.get(UpdatePlaybackPositionTransactionScript);
  });

  describe('apply', () => {
    it('should update position without duration when duration is not provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);

      mockNoteAudioRepository.updatePositionById.mockResolvedValue();

      // Act
      await target.apply(audioId, positionSeconds);

      // Assert
      expect(mockNoteAudioRepository.updatePositionById).toHaveBeenCalledWith(
        audioId,
        positionSeconds,
        undefined
      );
    });

    it('should update position with duration when duration is provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);
      const durationSeconds = generateRandomNumbers(10, 600);

      mockNoteAudioRepository.updatePositionById.mockResolvedValue();

      // Act
      await target.apply(audioId, positionSeconds, durationSeconds);

      // Assert
      expect(mockNoteAudioRepository.updatePositionById).toHaveBeenCalledWith(
        audioId,
        positionSeconds,
        durationSeconds
      );
    });

    it('should handle zero position correctly', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);

      mockNoteAudioRepository.updatePositionById.mockResolvedValue();

      // Act
      await target.apply(audioId, 0);

      // Assert
      expect(mockNoteAudioRepository.updatePositionById).toHaveBeenCalledWith(
        audioId,
        0,
        undefined
      );
    });

    it('should handle zero duration correctly when provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);

      mockNoteAudioRepository.updatePositionById.mockResolvedValue();

      // Act
      await target.apply(audioId, positionSeconds, 0);

      // Assert
      expect(mockNoteAudioRepository.updatePositionById).toHaveBeenCalledWith(
        audioId,
        positionSeconds,
        0
      );
    });
  });
});
