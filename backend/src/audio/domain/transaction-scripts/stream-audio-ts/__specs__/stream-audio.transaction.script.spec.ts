import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { StreamAudioTransactionScript } from '../stream-audio.transaction.script';
import { AudioFileCache } from '../../../../infrastructure/cache/audio-file.cache';
import { HermesRemoteCaller } from '../../../../infrastructure/remote-callers/hermes.remote-caller';
import { NoteAudioRepository } from '../../../../infrastructure/repositories/note-audio.repository';
import {
  NOTE_OWNERSHIP_PORT,
  NoteOwnershipPort,
} from '../../../../domain/ports/note-ownership.port';
import { NoteAudio } from '../../../../domain/entities/note-audio.entity';
import {
  generateRandomNumbers,
  createMock,
} from 'src/shared-kernel/test-utils';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

describe('StreamAudioTransactionScript', () => {
  let target: StreamAudioTransactionScript;
  let mockAudioFileCache: jest.Mocked<AudioFileCache>;
  let mockHermesRemoteCaller: jest.Mocked<HermesRemoteCaller>;
  let mockNoteAudioRepository: jest.Mocked<NoteAudioRepository>;
  let mockNoteOwnershipPort: jest.Mocked<NoteOwnershipPort>;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mocks
    mockAudioFileCache = createMock<AudioFileCache>({
      isCached: jest.fn(),
      getEntry: jest.fn(),
      saveAudio: jest.fn(),
    });

    mockHermesRemoteCaller = createMock<HermesRemoteCaller>({
      downloadAudioByPath: jest.fn(),
    });

    mockNoteAudioRepository = createMock<NoteAudioRepository>({
      findById: jest.fn(),
    });

    mockNoteOwnershipPort = createMock<NoteOwnershipPort>({
      verifyOwnership: jest.fn(),
    });

    mockResponse = createMock<Response>({
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      pipe: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        StreamAudioTransactionScript,
        { provide: AudioFileCache, useValue: mockAudioFileCache },
        {
          provide: HermesRemoteCaller,
          useValue: mockHermesRemoteCaller,
        },
        {
          provide: NoteAudioRepository,
          useValue: mockNoteAudioRepository,
        },
        {
          provide: NOTE_OWNERSHIP_PORT,
          useValue: mockNoteOwnershipPort,
        },
      ],
    }).compile();

    target = moduleRef.get(StreamAudioTransactionScript);
  });

  describe('apply', () => {
    it('should stream cached audio file with full content when no range header provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = undefined;
      const fileSize = 1024;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.wav`;
      const fileFormat = 'wav';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.wav`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(true);
      mockAudioFileCache.getEntry.mockReturnValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockNoteAudioRepository.findById).toHaveBeenCalledWith(audioId);
      expect(mockNoteOwnershipPort.verifyOwnership).toHaveBeenCalledWith(
        noteId,
        userId
      );
      expect(mockAudioFileCache.isCached).toHaveBeenCalledWith(audioId);
      expect(mockAudioFileCache.getEntry).toHaveBeenCalledWith(audioId);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Accept-Ranges',
        'bytes'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'audio/wav'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        fileSize.toString()
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(fs.createReadStream).toHaveBeenCalledWith(filePath, {
        start: 0,
        end: fileSize - 1,
      });
    });

    it('should stream partial content when range header is provided', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = 'bytes=0-1023';
      const fileSize = 2048;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.mp3`;
      const fileFormat = 'mp3';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.mp3`,
        fileName: 'test-audio.mp3',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.mp3`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(true);
      mockAudioFileCache.getEntry.mockReturnValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(206);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Range',
        'bytes 0-1023/2048'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        '1024'
      );
      expect(fs.createReadStream).toHaveBeenCalledWith(filePath, {
        start: 0,
        end: 1023,
      });
    });

    it('should download and cache audio when not cached', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = undefined;
      const fileSize = 1024;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.wav`;
      const fileFormat = 'wav';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockAudioData = Buffer.from('mock audio data');
      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.wav`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(false);
      mockHermesRemoteCaller.downloadAudioByPath.mockResolvedValue({
        data: mockAudioData,
        headers: { 'content-type': 'audio/wav' },
      });
      mockAudioFileCache.saveAudio.mockResolvedValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockAudioFileCache.isCached).toHaveBeenCalledWith(audioId);
      expect(mockHermesRemoteCaller.downloadAudioByPath).toHaveBeenCalledWith(
        mockAudio.filePath
      );
      expect(mockAudioFileCache.saveAudio).toHaveBeenCalledWith(
        audioId,
        fileFormat,
        mockAudioData
      );
    });

    it('should throw NotFoundException when audio does not exist', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const rangeHeader = undefined;

      mockNoteAudioRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        target.apply(audioId, userId, rangeHeader, mockResponse as any)
      ).rejects.toThrow(NotFoundException);

      expect(mockNoteAudioRepository.findById).toHaveBeenCalledWith(audioId);
    });

    it('should throw ForbiddenException when user does not own the note', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = undefined;

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat: 'wav',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(false);

      // Act & Assert
      await expect(
        target.apply(audioId, userId, rangeHeader, mockResponse as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle end of range not specified in range header', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = 'bytes=512-';
      const fileSize = 1024;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.wav`;
      const fileFormat = 'wav';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.wav`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(true);
      mockAudioFileCache.getEntry.mockReturnValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Range',
        'bytes 512-1023/1024'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        '512'
      );
      expect(fs.createReadStream).toHaveBeenCalledWith(filePath, {
        start: 512,
        end: 1023,
      });
    });

    it('should return full content when range is invalid', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = 'bytes=5000-6000'; // Out of bounds
      const fileSize = 1024;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.wav`;
      const fileFormat = 'wav';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.wav`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(true);
      mockAudioFileCache.getEntry.mockReturnValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        fileSize.toString()
      );
      expect(fs.createReadStream).toHaveBeenCalledWith(filePath, {
        start: 0,
        end: fileSize - 1,
      });
    });

    it('should set CORS headers on response', async () => {
      // Arrange
      const audioId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const noteId = generateRandomNumbers();
      const rangeHeader = undefined;
      const fileSize = 1024;
      const filePath = `/tmp/chronus-audio-cache/${audioId}.wav`;
      const fileFormat = 'wav';

      const mockAudio: NoteAudio = {
        id: audioId,
        noteId,
        filePath: `/hermes/audio/${audioId}.wav`,
        fileName: 'test-audio.wav',
        fileFormat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockCachedEntry = {
        filePath,
        fileName: `${audioId}.wav`,
        fileSize,
        format: fileFormat,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
        audioId,
      };

      const mockReadStream = {
        on: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

      mockNoteAudioRepository.findById.mockResolvedValue(mockAudio);
      mockNoteOwnershipPort.verifyOwnership.mockResolvedValue(true);
      mockAudioFileCache.isCached.mockReturnValue(true);
      mockAudioFileCache.getEntry.mockReturnValue(mockCachedEntry);

      // Act
      await target.apply(audioId, userId, rangeHeader, mockResponse as any);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, HEAD, OPTIONS'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Range'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'Content-Range, Accept-Ranges'
      );
    });
  });
});
