import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DELETE_CHECK_ITEMS_BY_NOTE_COMMAND, DeleteCheckItemsByNoteCommand } from 'src/shared-kernel/domain/cross-domain-commands/check-items/delete-check-items-by-note.command';
import { CheckItemsAggregator } from '../../domain/aggregators/check-items.aggregator';

@Injectable()
export class DeleteCheckItemsByNoteListener {
  constructor(private readonly checkItemsAggregator: CheckItemsAggregator) {}

  @OnEvent(DELETE_CHECK_ITEMS_BY_NOTE_COMMAND)
  async handleDeleteCheckItems(command: DeleteCheckItemsByNoteCommand): Promise<void> {
    await this.checkItemsAggregator.deleteCheckItemsByNoteId(command.noteId);
  }
}
