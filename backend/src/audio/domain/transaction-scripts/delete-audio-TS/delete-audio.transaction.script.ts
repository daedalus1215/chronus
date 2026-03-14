import { Injectable, Logger } from '@nestjs/common';
import { NoteAudioRepository } from '../../../infrastructure/repositories/note-audio.repository';
import { HermesRemoteCaller } from '../../../infrastructure/remote-callers/hermes.remote-caller';
import { AudioFileCache } from '../../../infrastructure/cache/audio-file.cache';

@Injectable()
export class DeleteAudioTransactionScript {
  private readonly logger = new Logger(DeleteAudioTransactionScript.name);

  constructor(
    private readonly noteAudioRepository: NoteAudioRepository,
    private readonly hermesRemoteCaller: HermesRemoteCaller,
    private readonly audioFileCache: AudioFileCache
  ) {}

  async apply(audioId: number, filePath: string): Promise<void> {
    await this.hermesRemoteCaller.deleteAudioByPath(filePath);
    this.logger.log(`Deleted audio file from Hermes: ${filePath}`);
    this.audioFileCache.evictEntry(audioId);
    await this.noteAudioRepository.deleteById(audioId);
    this.logger.log(`Deleted audio metadata for audioId: ${audioId}`);
  }
}
