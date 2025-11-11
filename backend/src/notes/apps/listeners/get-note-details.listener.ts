import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GET_NOTE_DETAILS_COMMAND, GetNoteDetailsCommand } from 'src/shared-kernel/domain/cross-domain-commands/notes/get-note-details.command';
import { NoteAggregator } from '../../domain/aggregators/note.aggregator';

@Injectable()
export class GetNoteDetailsListener {
  constructor(private readonly noteAggregator: NoteAggregator) {}

  @OnEvent(GET_NOTE_DETAILS_COMMAND)
  async handleGetNoteDetails(command: GetNoteDetailsCommand) {
    const note = await this.noteAggregator.getReference(command.noteId, command.userId);
    return note;
  }
}