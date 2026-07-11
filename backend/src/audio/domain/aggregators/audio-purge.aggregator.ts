import { Injectable, Logger } from '@nestjs/common';
import { NoteAudioRepository } from '../../infrastructure/repositories/note-audio.repository';
import { HermesRemoteCaller } from '../../infrastructure/remote-callers/hermes.remote-caller';

/**
 * Aggregator for purging (deleting) audio files from notes.
 * Called from note-transfer domain service after note ownership is validated.
 */
@Injectable()
export class AudioPurgeAggregator {
  private readonly logger = new Logger(AudioPurgeAggregator.name);

  constructor(
    private readonly noteAudioRepository: NoteAudioRepository,
    private readonly hermesRemoteCaller: HermesRemoteCaller
  ) {}

  /**
   * Deletes all audio files associated with the given note IDs.
   * Caller is responsible for validating note ownership before calling.
   * @param noteIds - Array of note IDs whose audio should be purged
   * @returns Array of file paths that were deleted (for logging)
   */
  async purgeByNoteIds(noteIds: number[]): Promise<string[]> {
    const deletedFilePaths: string[] = [];

    for (const noteId of noteIds) {
      const audios = await this.noteAudioRepository.findByNoteId(noteId);

      for (const audio of audios) {
        try {
          if (audio.filePath) {
            await this.hermesRemoteCaller.deleteAudioByPath(audio.filePath);
            deletedFilePaths.push(audio.filePath);
            this.logger.log(
              `Deleted audio file from Hermes: ${audio.filePath}`
            );
          }
          await this.noteAudioRepository.deleteById(audio.id);
          this.logger.log(`Deleted audio metadata for audioId: ${audio.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to delete audio ${audio.id} for note ${noteId}:`,
            error
          );
        }
      }
    }

    return deletedFilePaths;
  }
}
