import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AudioService } from '../audio.service';
import { TextToSpeechTransactionScript } from '../../transaction-scripts/text-to-speech-TS/text-to-speech.transaction.script';
import { SaveNoteAudioTransactionScript } from '../../transaction-scripts/save-note-audio-TS/save-note-audio.transaction.script';
import { DownloadAudioTransactionScript } from '../../transaction-scripts/download-audio-TS/download-audio.transaction.script';
import { GetNoteAudiosTransactionScript } from '../../transaction-scripts/get-note-audios-TS/get-note-audios.transaction.script';
import { GetNoteAudioByIdTransactionScript } from '../../transaction-scripts/get-note-audio-by-id-TS/get-note-audio-by-id.transaction.script';
import { DeleteAudioTransactionScript } from '../../transaction-scripts/delete-audio-TS/delete-audio.transaction.script';
import { UpdatePlaybackPositionTransactionScript } from '../../transaction-scripts/update-playback-position-TS/update-playback-position.transaction.script';
import { NoteAggregator } from 'src/notes/domain/aggregators/note.aggregator';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import { NoteAudio } from '../../entities/note-audio.entity';
import { TextToSpeechRequestDto } from '../../../apps/dtos/requests/text-to-speech.dto';
import { createMock } from 'src/shared-kernel/test-utils';

describe('AudioService', () => {
  let target: AudioService;
  let mockTextToSpeechTS: jest.Mocked<TextToSpeechTransactionScript>;
  let mockSaveNoteAudioTS: jest.Mocked<SaveNoteAudioTransactionScript>;
  let mockDownloadAudioTS: jest.Mocked<DownloadAudioTransactionScript>;
  let mockGetNoteAudiosTS: jest.Mocked<GetNoteAudiosTransactionScript>;
  let mockGetNoteAudioByIdTS: jest.Mocked<GetNoteAudioByIdTransactionScript>;
  let mockDeleteAudioTS: jest.Mocked<DeleteAudioTransactionScript>;
  let mockUpdatePlaybackPositionTS: jest.Mocked<UpdatePlaybackPositionTransactionScript>;
  let mockNoteAggregator: jest.Mocked<NoteAggregator>;

  const userId = 7;
  const assetId = 11;

  const makeNoteAudio = (overrides: Partial<NoteAudio> = {}): NoteAudio => {
    const audio = new NoteAudio();
    audio.id = 42;
    audio.noteId = assetId;
    audio.filePath = '/var/lib/chronus/hermes/combined_2026-01-15_10-30-00.wav';
    audio.fileName = 'combined_2026-01-15_10-30-00.wav';
    audio.fileFormat = 'wav';
    return Object.assign(audio, overrides);
  };

  const makeNoteReference = (
    overrides: Partial<{ id: number; name: string; userId: number }> = {}
  ) => ({
    id: assetId,
    name: 'Note',
    userId,
    ...overrides,
  });

  const makeNote = (description: string): Note => {
    const note = new Note();
    note.id = assetId;
    note.name = 'Note';
    note.userId = userId;
    const memo = new Memo();
    memo.id = 3;
    memo.description = description;
    note.memo = memo;
    return note;
  };

  beforeEach(async () => {
    mockTextToSpeechTS = createMock<TextToSpeechTransactionScript>({
      execute: jest.fn(),
    });
    mockSaveNoteAudioTS = createMock<SaveNoteAudioTransactionScript>({
      execute: jest.fn(),
    });
    mockDownloadAudioTS = createMock<DownloadAudioTransactionScript>({
      execute: jest.fn(),
      executeByPath: jest.fn(),
    });
    mockGetNoteAudiosTS = createMock<GetNoteAudiosTransactionScript>({
      execute: jest.fn(),
    });
    mockGetNoteAudioByIdTS = createMock<GetNoteAudioByIdTransactionScript>({
      execute: jest.fn(),
    });
    mockDeleteAudioTS = createMock<DeleteAudioTransactionScript>({
      apply: jest.fn(),
    });
    mockUpdatePlaybackPositionTS =
      createMock<UpdatePlaybackPositionTransactionScript>({
        apply: jest.fn(),
      });
    mockNoteAggregator = createMock<NoteAggregator>({
      getMemoById: jest.fn(),
      getReference: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AudioService,
        {
          provide: TextToSpeechTransactionScript,
          useValue: mockTextToSpeechTS,
        },
        {
          provide: SaveNoteAudioTransactionScript,
          useValue: mockSaveNoteAudioTS,
        },
        {
          provide: DownloadAudioTransactionScript,
          useValue: mockDownloadAudioTS,
        },
        {
          provide: GetNoteAudiosTransactionScript,
          useValue: mockGetNoteAudiosTS,
        },
        {
          provide: GetNoteAudioByIdTransactionScript,
          useValue: mockGetNoteAudioByIdTS,
        },
        {
          provide: DeleteAudioTransactionScript,
          useValue: mockDeleteAudioTS,
        },
        {
          provide: UpdatePlaybackPositionTransactionScript,
          useValue: mockUpdatePlaybackPositionTS,
        },
        {
          provide: NoteAggregator,
          useValue: mockNoteAggregator,
        },
      ],
    }).compile();

    target = moduleRef.get(AudioService);
  });

  describe('convertTextToSpeech', () => {
    it('transcribes the memo text, saves the returned metadata, and returns the TTS file path with the saved metadata', async () => {
      // Arrange
      const request = new TextToSpeechRequestDto();
      request.assetId = assetId;
      const ttsResult = {
        file_path: '/tmp/tts/out.wav',
        file_name: 'out.wav',
        fileFormat: 'wav',
      };
      const savedAudio = makeNoteAudio();
      mockNoteAggregator.getMemoById.mockResolvedValue(makeNote('Say hello'));
      mockTextToSpeechTS.execute.mockResolvedValue(ttsResult);
      mockSaveNoteAudioTS.execute.mockResolvedValue(savedAudio);

      // Act
      const result = await target.convertTextToSpeech({
        ...request,
        userId,
      });

      // Assert
      expect(mockNoteAggregator.getMemoById).toHaveBeenCalledWith(
        assetId,
        userId
      );
      expect(mockTextToSpeechTS.execute).toHaveBeenCalledWith({
        assetId,
        userId,
        text: 'Say hello',
      });
      expect(mockSaveNoteAudioTS.execute).toHaveBeenCalledWith({
        noteId: assetId,
        filePath: ttsResult.file_path,
        fileName: ttsResult.file_name,
        fileFormat: ttsResult.fileFormat,
      });
      expect(result).toEqual({
        file_path: ttsResult.file_path,
        audioMetadata: savedAudio,
      });
    });

    it('propagates the memo lookup failure without calling TTS or saving metadata', async () => {
      // Arrange
      const request = new TextToSpeechRequestDto();
      request.assetId = assetId;
      mockNoteAggregator.getMemoById.mockRejectedValue(
        new Error('Memo not found')
      );

      // Act / Assert
      await expect(
        target.convertTextToSpeech({ ...request, userId })
      ).rejects.toThrow('Memo not found');
      expect(mockTextToSpeechTS.execute).not.toHaveBeenCalled();
      expect(mockSaveNoteAudioTS.execute).not.toHaveBeenCalled();
    });
  });

  describe('getNoteAudioById', () => {
    it('returns the audio when the user owns the associated note', async () => {
      // Arrange
      const audio = makeNoteAudio();
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(audio);
      mockNoteAggregator.getReference.mockResolvedValue(makeNoteReference());

      // Act
      const result = await target.getNoteAudioById(42, userId);

      // Assert
      expect(mockNoteAggregator.getReference).toHaveBeenCalledWith(
        audio.noteId,
        userId
      );
      expect(result).toEqual(audio);
    });

    it('throws NotFoundException when no audio exists for the id', async () => {
      // Arrange
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(null);

      // Act / Assert
      await expect(target.getNoteAudioById(42, userId)).rejects.toThrow(
        new NotFoundException('Audio not found')
      );
      expect(mockNoteAggregator.getReference).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the note reference does not belong to the user', async () => {
      // Arrange
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(makeNoteAudio());
      mockNoteAggregator.getReference.mockResolvedValue(
        makeNoteReference({ userId: 8 })
      );

      // Act / Assert
      await expect(target.getNoteAudioById(42, userId)).rejects.toThrow(
        new ForbiddenException('Not authorized to access this audio')
      );
    });

    it('throws ForbiddenException when no note reference is resolved', async () => {
      // Arrange
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(makeNoteAudio());
      mockNoteAggregator.getReference.mockResolvedValue(null);

      // Act / Assert
      await expect(target.getNoteAudioById(42, userId)).rejects.toThrow(
        new ForbiddenException('Not authorized to access this audio')
      );
    });
  });

  describe('downloadAudioById', () => {
    const allowAccess = (audio: NoteAudio) => {
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(audio);
      mockNoteAggregator.getReference.mockResolvedValue(makeNoteReference());
    };

    it('downloads by path when the stored file path is absolute and prefers header content-type and content-disposition', async () => {
      // Arrange
      const audio = makeNoteAudio();
      allowAccess(audio);
      mockDownloadAudioTS.executeByPath.mockResolvedValue({
        data: Buffer.from('bytes'),
        headers: {
          'content-type': 'audio/wav',
          'content-disposition': 'attachment; filename="header-name.wav"',
        },
      });

      // Act
      const result = await target.downloadAudioById(42, userId);

      // Assert
      expect(mockDownloadAudioTS.executeByPath).toHaveBeenCalledWith(
        audio.filePath
      );
      expect(mockDownloadAudioTS.execute).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: Buffer.from('bytes'),
        contentType: 'audio/wav',
        contentDisposition: 'attachment; filename="header-name.wav"',
        fileName: audio.fileName,
      });
    });

    it('falls back to the note id download with no file name when the stored path is not absolute', async () => {
      // Arrange
      const audio = makeNoteAudio({
        filePath: 'hermes/audio/clip.wav',
        fileName: 'clip.wav',
        fileFormat: 'mp3',
      });
      allowAccess(audio);
      mockDownloadAudioTS.execute.mockResolvedValue({
        data: Buffer.from('bytes'),
        headers: {},
      });

      // Act
      const result = await target.downloadAudioById(42, userId);

      // Assert
      expect(mockDownloadAudioTS.execute).toHaveBeenCalledWith(
        userId,
        audio.noteId.toString(),
        undefined
      );
      expect(mockDownloadAudioTS.executeByPath).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: Buffer.from('bytes'),
        contentType: 'audio/mpeg',
        contentDisposition: 'attachment; filename="clip.wav"',
        fileName: 'clip.wav',
      });
    });

    it('passes the combined file name to the note id download when it matches the Hermes combined pattern', async () => {
      // Arrange
      const combinedName = 'combined_2026-01-15_10-30-00.wav';
      const audio = makeNoteAudio({
        filePath: 'hermes/audio/combined_2026-01-15_10-30-00.wav',
        fileName: combinedName,
      });
      allowAccess(audio);
      mockDownloadAudioTS.execute.mockResolvedValue({
        data: Buffer.from('bytes'),
        headers: {},
      });

      // Act
      const result = await target.downloadAudioById(42, userId);

      // Assert
      expect(mockDownloadAudioTS.execute).toHaveBeenCalledWith(
        userId,
        audio.noteId.toString(),
        combinedName
      );
      expect(result.contentDisposition).toBe(
        `attachment; filename="${combinedName}"`
      );
      expect(result.fileName).toBe(combinedName);
    });

    it('maps known file formats to content types and defaults unknown formats to audio/wav', async () => {
      const cases: Array<[string, string]> = [
        ['wav', 'audio/wav'],
        ['mp3', 'audio/mpeg'],
        ['ogg', 'audio/ogg'],
        ['m4a', 'audio/mp4'],
        ['flac', 'audio/flac'],
        ['aac', 'audio/aac'],
        ['xyz', 'audio/wav'],
      ];
      for (const [fileFormat, expectedContentType] of cases) {
        const audio = makeNoteAudio({
          filePath: 'hermes/audio/clip.wav',
          fileFormat,
        });
        allowAccess(audio);
        mockDownloadAudioTS.execute.mockReset();
        mockDownloadAudioTS.execute.mockResolvedValue({
          data: Buffer.from('bytes'),
          headers: {},
        });

        const result = await target.downloadAudioById(42, userId);

        expect(result.contentType).toBe(expectedContentType);
      }
    });

    it('treats the file format as case-insensitive when mapping the content type', async () => {
      // Arrange
      const audio = makeNoteAudio({
        filePath: 'hermes/audio/clip.wav',
        fileFormat: 'MP3',
      });
      allowAccess(audio);
      mockDownloadAudioTS.execute.mockResolvedValue({
        data: Buffer.from('bytes'),
        headers: {},
      });

      // Act
      const result = await target.downloadAudioById(42, userId);

      // Assert
      expect(result.contentType).toBe('audio/mpeg');
    });

    it('refuses the download when the user does not own the note', async () => {
      // Arrange
      mockGetNoteAudioByIdTS.execute.mockResolvedValue(makeNoteAudio());
      mockNoteAggregator.getReference.mockResolvedValue(
        makeNoteReference({ userId: 8 })
      );

      // Act / Assert
      await expect(target.downloadAudioById(42, userId)).rejects.toThrow(
        new ForbiddenException('Not authorized to access this audio')
      );
      expect(mockDownloadAudioTS.execute).not.toHaveBeenCalled();
      expect(mockDownloadAudioTS.executeByPath).not.toHaveBeenCalled();
    });
  });
});
