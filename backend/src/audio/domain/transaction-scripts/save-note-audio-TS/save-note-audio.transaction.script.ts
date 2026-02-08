import { Injectable } from '@nestjs/common';
import { NoteAudio } from '../../entities/note-audio.entity';
import { NoteAudioRepository } from '../../../infra/repositories/note-audio.repository';

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

    const noteAudio = await this.noteAudioRepository.create(
      noteId,
      filePath,
      fileName,
      fileFormat
    );

    return noteAudio;
  }
}
