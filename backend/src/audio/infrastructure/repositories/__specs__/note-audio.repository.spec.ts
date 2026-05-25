import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteAudioRepository } from '../note-audio.repository';
import { NoteAudio } from '../../../domain/entities/note-audio.entity';
import {
  generateRandomNumbers,
  createMock,
} from 'src/shared-kernel/test-utils';

describe('NoteAudioRepository', () => {
  let target: NoteAudioRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<NoteAudio>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTypeOrmRepository = createMock<Repository<NoteAudio>>({
      update: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteAudioRepository,
        {
          provide: getRepositoryToken(NoteAudio),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    target = module.get(NoteAudioRepository);
  });

  describe('updatePositionById', () => {
    it('should update only position when duration is not provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);

      mockTypeOrmRepository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: '',
      });

      // Act
      await target.updatePositionById(audioId, positionSeconds);

      // Assert
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(audioId, {
        lastPositionSeconds: positionSeconds,
      });
    });

    it('should update both position and duration when duration is provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);
      const durationSeconds = generateRandomNumbers(10, 600);

      mockTypeOrmRepository.update.mockResolvedValue({
        affected: 1,
        raw: '',
        generatedMaps: [],
      });

      // Act
      await target.updatePositionById(
        audioId,
        positionSeconds,
        durationSeconds
      );

      // Assert
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(audioId, {
        lastPositionSeconds: positionSeconds,
        durationSeconds,
      });
    });

    it('should include duration when it is explicitly zero', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);

      mockTypeOrmRepository.update.mockResolvedValue({
        affected: 1,
        raw: '',
        generatedMaps: [],
      });

      // Act
      await target.updatePositionById(audioId, positionSeconds, 0);

      // Assert
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(audioId, {
        lastPositionSeconds: positionSeconds,
        durationSeconds: 0,
      });
    });

    it('should not include duration when undefined is passed', async () => {
      // Arrange
      const audioId = generateRandomNumbers(1, 1000);
      const positionSeconds = generateRandomNumbers(1, 300);

      mockTypeOrmRepository.update.mockResolvedValue({
        affected: 1,
        raw: '',
        generatedMaps: [],
      });

      // Act
      await target.updatePositionById(audioId, positionSeconds, undefined);

      // Assert
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(audioId, {
        lastPositionSeconds: positionSeconds,
      });
    });
  });
});
