import { Injectable } from '@nestjs/common';
import { NoteAudio } from '../../entities/note-audio.entity';
import { NoteAudioRepository } from '../../../infra/repositories/note-audio.repository';

export interface SaveNoteAudioParams {
  noteId: number;
  filePath: string;
  fileFormat: string;
}

@Injectable()
export class SaveNoteAudioTransactionScript {
  constructor(private readonly noteAudioRepository: NoteAudioRepository) {}

  async execute(params: SaveNoteAudioParams): Promise<NoteAudio> {
    const { noteId, filePath, fileFormat } = params;

    // Generate technical file name: note-{noteId}-{timestamp}.{format}
    const timestamp = Date.now();
    const fileName = `note-${noteId}-${timestamp}.${fileFormat}`;

    const noteAudio = await this.noteAudioRepository.create(
      noteId,
      filePath,
      fileName,
      fileFormat
    );

    return noteAudio;
  }
}
