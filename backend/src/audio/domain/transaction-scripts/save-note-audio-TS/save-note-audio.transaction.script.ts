import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { NoteAudio } from '../../entities/note-audio.entity';
import { NoteAudioRepository } from '../../../infrastructure/repositories/note-audio.repository';

export type SaveNoteAudioParams = {
  noteId: number;
  filePath: string;
  fileName: string;
  fileFormat: string;
};

@Injectable()
export class SaveNoteAudioTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async execute(params: SaveNoteAudioParams): Promise<NoteAudio> {
    const { noteId, filePath, fileName, fileFormat } = params;
    const resolvedFileName = this.getFileNameFromPath(filePath) || fileName;

    const noteAudio = await this.noteAudioRepository.create(
      noteId,
      filePath,
      resolvedFileName,
      fileFormat
    );

    return noteAudio;
  }

  private getFileNameFromPath(filePath: string): string {
    if (!filePath) {
      return '';
    }
    return path.basename(filePath);
  }
}
