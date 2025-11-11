import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NoteAggregator } from '../../domain/aggregators/note.aggregator';
import { VERIFY_NOTE_ACCESS_COMMAND, VerifyNoteAccessCommand } from 'src/shared-kernel/domain/cross-domain-commands/notes/verify-note-access.command';

@Injectable()
export class VerifyNoteAccessListener {
  constructor(private readonly noteAggregator: NoteAggregator) {}

  @OnEvent(VERIFY_NOTE_ACCESS_COMMAND)
  async handleVerifyNoteAccess(event: VerifyNoteAccessCommand): Promise<void> {
    const note = await this.noteAggregator.getReference(event.noteId, event.userId);
    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }
  }
}
