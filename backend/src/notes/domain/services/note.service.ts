import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from '../entities/notes/note.entity';
import { ArchiveNoteTransactionScript } from '../transaction-scripts/archive-note/archive-note.transaction.script';
import { GetNoteByIdTransactionScript } from '../transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteTransactionScript } from '../transaction-scripts/update-note-TS/update-note.transaction.script';
import { UpdateNoteDto } from '../../apps/dtos/requests/update-note.dto';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DELETE_CHECK_ITEMS_BY_NOTE_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/check-items/delete-check-items-by-note.command';
import { DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/tags/delete-note-tag-associations.command';
import { CheckItemsAggregator } from 'src/check-items/domain/aggregators/check-items.aggregator';
import { CheckItemProjection } from 'src/check-items/domain/aggregators/check-items.aggregator';

export type NoteWithCheckItems = {
  note: Note;
  checkItems: CheckItemProjection[];
};

@Injectable()
export class NoteService {
  constructor(
    private readonly archiveNoteTransactionScript: ArchiveNoteTransactionScript,
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript,
    private readonly updateNoteTransactionScript: UpdateNoteTransactionScript,
    private readonly eventEmitter: EventEmitter2,
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly checkItemsAggregator: CheckItemsAggregator
  ) {}

  async archiveNote(noteId: number, authUser: AuthUser): Promise<Note> {
    return await this.archiveNoteTransactionScript.apply(
      noteId,
      authUser.userId
    );
  }

  async getNoteByIdWithCheckItems(
    noteId: number,
    userId: number
  ): Promise<NoteWithCheckItems> {
    const note = await this.getNoteByIdTransactionScript.apply(noteId, userId);
    const checkItems = await this.checkItemsAggregator.findByNoteId(
      noteId,
      userId
    );
    return {
      note,
      checkItems,
    };
  }

  async updateNoteWithCheckItems(
    noteId: number,
    updateNoteDto: UpdateNoteDto,
    userId: number
  ): Promise<NoteWithCheckItems> {
    const note = await this.updateNoteTransactionScript.apply(
      noteId,
      updateNoteDto,
      userId
    );
    const checkItems = await this.checkItemsAggregator.findByNoteId(
      noteId,
      userId
    );
    return {
      note,
      checkItems,
    };
  }

  async deleteNote(noteId: number, userId: number): Promise<void> {
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) throw new NotFoundException('Note not found');

    await this.eventEmitter.emitAsync(DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND, {
      noteId,
      userId,
    });

    await this.eventEmitter.emitAsync(DELETE_CHECK_ITEMS_BY_NOTE_COMMAND, {
      noteId,
      userId,
    });

    await this.noteRepository.deleteNoteById(noteId, userId);
  }
}
