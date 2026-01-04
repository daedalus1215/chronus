import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND,
  DeleteNoteTagAssociationsCommand,
} from 'src/shared-kernel/domain/cross-domain-commands/tags/delete-note-tag-associations.command';
import { TagNoteRepository } from '../../infra/repositories/tag-note.repository';

@Injectable()
export class DeleteNoteTagAssociationsListener {
  constructor(private readonly tagNoteRepository: TagNoteRepository) {}

  @OnEvent(DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND)
  async handleDeleteTagAssociations(
    command: DeleteNoteTagAssociationsCommand
  ): Promise<void> {
    await this.tagNoteRepository.deleteByNoteId(command.noteId);
  }
}
