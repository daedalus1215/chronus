import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { AudioFileCache } from '../../../infrastructure/cache/audio-file.cache';
import { HermesRemoteCaller } from '../../../infrastructure/remote-callers/hermes.remote-caller';
import { NoteAudioRepository } from '../../../infrastructure/repositories/note-audio.repository';
import {
  NoteOwnershipPort,
  NOTE_OWNERSHIP_PORT,
} from '../../ports/note-ownership.port';
import { NoteAudio } from '../../entities/note-audio.entity';

interface Range {
  start: number;
  end: number;
}

@Injectable()
export class StreamAudioTransactionScript {
  private readonly logger = new Logger(StreamAudioTransactionScript.name);

  constructor(
    private readonly audioFileCache: AudioFileCache,
    private readonly hermesRemoteCaller: HermesRemoteCaller,
    private readonly noteAudioRepository: NoteAudioRepository,
    @Inject(NOTE_OWNERSHIP_PORT)
    private readonly noteOwnershipPort: NoteOwnershipPort
  ) {}

  async apply(
    audioId: number,
    userId: number,
    rangeHeader: string | undefined,
    res: Response
  ): Promise<void> {
    // Get audio metadata and verify ownership
    const audio = await this.getAudioMetadata(audioId, userId);

    // Ensure audio is cached
    const cachedEntry = await this.ensureCached(audioId, audio);

    // Parse range header
    const range = this.parseRange(rangeHeader, cachedEntry.fileSize);

    // Stream the audio file
    this.streamFile(
      cachedEntry.filePath,
      range,
      cachedEntry.fileSize,
      audio.fileFormat,
      res
    );
  }

  private async getAudioMetadata(
    audioId: number,
    userId: number
  ): Promise<NoteAudio> {
    const audio = await this.noteAudioRepository.findById(audioId);

    if (!audio) {
      throw new NotFoundException('Audio not found');
    }

    // Verify user owns the note associated with this audio
    const isOwner = await this.noteOwnershipPort.verifyOwnership(
      audio.noteId,
      userId
    );
    if (!isOwner) {
      throw new ForbiddenException('Not authorized to access this audio');
    }

    return audio;
  }

  private async ensureCached(audioId: number, audio: NoteAudio) {
    // Check if already cached
    if (this.audioFileCache.isCached(audioId)) {
      const entry = this.audioFileCache.getEntry(audioId);
      if (entry) {
        return entry;
      }
    }

    // Download from Hermes and cache
    this.logger.log(`Downloading audio ${audioId} from Hermes for caching`);

    const downloadResult = await this.hermesRemoteCaller.downloadAudioByPath(
      audio.filePath
    );
    const format = audio.fileFormat.toLowerCase();

    const cachedEntry = await this.audioFileCache.saveAudio(
      audioId,
      format,
      downloadResult.data
    );

    this.logger.log(
      `Cached audio ${audioId}: ${cachedEntry.fileName} (${cachedEntry.fileSize} bytes)`
    );
    return cachedEntry;
  }

  private parseRange(rangeHeader: string | undefined, fileSize: number): Range {
    if (!rangeHeader) {
      return { start: 0, end: fileSize - 1 };
    }

    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!match) {
      return { start: 0, end: fileSize - 1 };
    }

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      return { start: 0, end: fileSize - 1 };
    }

    return { start, end };
  }

  private streamFile(
    filePath: string,
    range: Range,
    fileSize: number,
    format: string,
    res: Response
  ): void {
    const contentType = this.getContentType(format);
    const isRangeRequest = range.start !== 0 || range.end !== fileSize - 1;

    // Set CORS headers for cross-origin audio streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Range, Accept-Ranges'
    );

    // Set common headers
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', contentType);

    if (isRangeRequest) {
      // Partial content response (206)
      const contentLength = range.end - range.start + 1;
      res.status(206);
      res.setHeader(
        'Content-Range',
        `bytes ${range.start}-${range.end}/${fileSize}`
      );
      res.setHeader('Content-Length', contentLength.toString());

      this.logger.debug(
        `Streaming range: bytes ${range.start}-${range.end}/${fileSize}`
      );
    } else {
      // Full content response (200)
      res.status(200);
      res.setHeader('Content-Length', fileSize.toString());
    }

    // Create read stream with optional range
    const stream = fs.createReadStream(filePath, {
      start: range.start,
      end: range.end,
    });

    stream.on('error', error => {
      this.logger.error(`Error streaming file: ${filePath}`, error);
      if (!res.headersSent) {
        res.status(500).send('Error streaming audio file');
      }
    });

    stream.pipe(res);
  }

  private getContentType(fileFormat: string): string {
    const format = fileFormat.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      flac: 'audio/flac',
      aac: 'audio/aac',
    };
    return contentTypes[format] || 'audio/wav';
  }
}
