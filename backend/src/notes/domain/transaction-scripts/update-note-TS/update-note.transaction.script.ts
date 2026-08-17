import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNoteDto } from 'src/notes/apps/dtos/requests/update-note.dto';
import { NoteMemoTagRepository } from '../../../infra/repositories/note-memo-tag.repository';
import { NoteVersionRepository } from '../../../infra/repositories/note-version.repository';
import { Note } from '../../entities/notes/note.entity';
import { UpdateNoteParamsToEntityConverter } from './update-note-params-to-entity.converter';
import { UpdateNoteParams } from './update-note.params';

const MAX_VERSIONS = 20;

@Injectable()
export class UpdateNoteTransactionScript {
  constructor(
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly updateNoteParamsToEntityConverter: UpdateNoteParamsToEntityConverter,
    private readonly noteVersionRepository: NoteVersionRepository
  ) {}

  async apply(
    id: number,
    updateNoteDto: UpdateNoteDto,
    userId: number
  ): Promise<Note> {
    const note = await this.noteRepository.findById(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Capture version snapshot BEFORE the save (memo notes only)
    // Skip if explicitly requested (e.g., when loading a version from history)
    if (
      note.memo &&
      updateNoteDto.description !== undefined &&
      !updateNoteDto.skipVersionCapture
    ) {
      await this.captureVersion(id, note.memo.description);
    }

    // Convert DTO to Params (domain layer boundary)
    const updateNoteParams: UpdateNoteParams = {
      name: updateNoteDto.name,
      description: updateNoteDto.description,
      tags: updateNoteDto.tags,
    };

    return await this.noteRepository.save(
      this.updateNoteParamsToEntityConverter.apply(updateNoteParams, note)
    );
  }

  /**
   * Snapshot the previous description into a version entry.
   * Skips if byte-identical to the latest version (dedupe).
   * Evicts oldest versions beyond the hard cap.
   */
  private async captureVersion(
    noteId: number,
    currentDescription: string
  ): Promise<void> {
    // Dedupe: skip if byte-identical to latest version
    const latestDesc = await this.noteVersionRepository.getLatestDescription(
      noteId
    );
    if (latestDesc === currentDescription) {
      return;
    }

    const nextVersionNum =
      (await this.noteVersionRepository.getLatestVersionNum(noteId)) + 1;

    await this.noteVersionRepository.create(
      noteId,
      nextVersionNum,
      currentDescription
    );

    await this.noteVersionRepository.deleteOldestBeyond(
      noteId,
      MAX_VERSIONS
    );
  }
}
