import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as path from 'path';
import {
  TextToSpeechRequestDto,
} from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse, AudioDownloadResult } from 'src/audio/apps/dtos/responses/audio.response.dto';
import {
  TextToSpeechTransactionScript,
} from '../transaction-scripts/text-to-speech.transaction.script';
import { SaveNoteAudioTransactionScript } from '../transaction-scripts/save-note-audio-TS/save-note-audio.transaction.script';
import { DownloadAudioTransactionScript } from '../transaction-scripts/download-audio.transaction.script';
import { GetNoteAudiosTransactionScript } from '../transaction-scripts/get-note-audios-TS/get-note-audios.transaction.script';
import { GetNoteAudioByIdTransactionScript } from '../transaction-scripts/get-note-audio-by-id-TS/get-note-audio-by-id.transaction.script';
import { NoteAggregator } from 'src/notes/domain/aggregators/note.aggregator';
import { NoteAudio } from '../entities/note-audio.entity';

export type ConvertTextToSpeechResult = {
  file_path: string;
  audioMetadata: NoteAudio;
};

@Injectable()
export class AudioService {
  constructor(
    private readonly textToSpeechTS: TextToSpeechTransactionScript,
    private readonly saveNoteAudioTS: SaveNoteAudioTransactionScript,
    private readonly downloadAudioTS: DownloadAudioTransactionScript,
    private readonly getNoteAudiosTS: GetNoteAudiosTransactionScript,
    private readonly getNoteAudioByIdTS: GetNoteAudioByIdTransactionScript,
    private readonly noteAggregator: NoteAggregator
  ) {}

  async convertTextToSpeech(
    request: TextToSpeechRequestDto & { userId: number }
  ): Promise<ConvertTextToSpeechResult> {
    const note = await this.noteAggregator.getMemoById(
      request.assetId,
      request.userId
    );
    
    // Step 1: Convert text to speech
    const ttsResult = await this.textToSpeechTS.execute({
      ...request,
      text: note.memo.description,
    });

    // Step 2: Save audio metadata to database
    const audioMetadata = await this.saveNoteAudioTS.execute({
      noteId: request.assetId,
      filePath: ttsResult.file_path,
      fileName: ttsResult.file_name,
      fileFormat: ttsResult.fileFormat,
    });

    return {
      file_path: ttsResult.file_path,
      audioMetadata,
    };
  }

  async downloadAudio(userId: number, assetId: string): Promise<AudioResponse> {
    return this.downloadAudioTS.execute(userId, assetId);
  }

  async getNoteAudios(noteId: number): Promise<NoteAudio[]> {
    return this.getNoteAudiosTS.execute(noteId);
  }

  async getNoteAudioById(audioId: number, userId: number): Promise<NoteAudio> {
    const audio = await this.getNoteAudioByIdTS.execute(audioId);

    if (!audio) {
      throw new NotFoundException('Audio not found');
    }

    // Verify user owns the note associated with this audio
    const note = await this.noteAggregator.getReference(audio.noteId, userId);
    if (!note || note.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audio');
    }

    return audio;
  }

  async downloadAudioById(audioId: number, userId: number): Promise<AudioDownloadResult> {
    const audio = await this.getNoteAudioById(audioId, userId);
    const filePath = this.getHermesDownloadFilePath(audio.filePath);
    const downloadFileName = this.getHermesDownloadFileName(audio.fileName);
    const { data, headers } = filePath
      ? await this.downloadAudioTS.executeByPath(filePath)
      : await this.downloadAudioTS.execute(
          userId,
          audio.noteId.toString(),
          downloadFileName
        );
    const contentType = this.getContentType(audio.fileFormat);

    return {
      data,
      contentType: headers['content-type'] || contentType,
      contentDisposition:
        headers['content-disposition'] ||
        `attachment; filename="${downloadFileName || audio.fileName}"`,
      fileName: audio.fileName,
    };
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

  private getHermesDownloadFileName(fileName: string): string | undefined {
    if (!fileName) {
      return undefined;
    }
    const isCombinedFile = /^combined_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.wav$/;
    if (!isCombinedFile.test(fileName)) {
      return undefined;
    }
    return fileName;
  }

  private getHermesDownloadFilePath(filePath: string): string | undefined {
    if (!filePath) {
      return undefined;
    }
    if (!path.isAbsolute(filePath)) {
      return undefined;
    }
    return filePath;
  }
}
