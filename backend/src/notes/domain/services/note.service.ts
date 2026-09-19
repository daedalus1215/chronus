import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from '../entities/notes/note.entity';
import { ArchiveNoteTransactionScript } from '../transaction-scripts/archive-note/archive-note.transaction.script';
import { ConvertChecklistToMemoTransactionScript } from '../transaction-scripts/convert-checklist-to-memo-TS/convert-checklist-to-memo.transaction.script';
import { GetNoteByIdTransactionScript } from '../transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteTransactionScript } from '../transaction-scripts/update-note-TS/update-note.transaction.script';
import { CreateNoteTransactionScript } from '../transaction-scripts/create-note.transaction.script';
import { CreateNoteCommand } from '../transaction-scripts/create-note.command';
import { UpdateNoteTitleTransactionScript } from '../transaction-scripts/update-note-title.transaction.script';
import { MoveNoteToFolderTransactionScript } from '../transaction-scripts/move-note-to-folder.transaction.script';
import {
  ReorderNotesTransactionScript,
  ReorderNotesInput,
} from '../transaction-scripts/reorder-notes.transaction.script';
import {
  GetNoteNamesByUserIdTransactionScript,
  GetNoteNamesQuery,
  GetNoteNamesResult,
} from '../transaction-scripts/get-note-names-by-user-id.transaction.script';
import { GetNoteNamesForExplorerTransactionScript } from '../transaction-scripts/get-note-names-for-explorer.transaction.script';
import { NoteNameRow } from '../transaction-scripts/note-name-row.projection';
import { GetNoteVersionsTransactionScript } from '../transaction-scripts/get-note-versions.transaction.script';
import { NoteVersion } from '../entities/notes/note-version.entity';
import { LoadNoteVersionTransactionScript } from '../transaction-scripts/load-note-version.transaction.script';
import { UpdateNoteDto } from '../../apps/dtos/requests/update-note.dto';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { NoteMemoTagRepository } from '../../infra/repositories/note-memo-tag.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DELETE_CHECK_ITEMS_BY_NOTE_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/check-items/delete-check-items-by-note.command';
import { DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/tags/delete-note-tag-associations.command';
import { CheckItemsAggregator } from 'src/check-items/domain/aggregators/check-items.aggregator';
import { CheckItemProjection } from 'src/check-items/domain/aggregators/check-items.aggregator';
import {
  SearchNotesTransactionScript,
  NoteSearchMatches,
} from '../transaction-scripts/search-notes.transaction.script';

export type NoteWithCheckItems = {
  note: Note;
  checkItems: CheckItemProjection[];
};

export type SearchResults = NoteSearchMatches & {
  query: string;
  checkItemMatches: {
    noteId: number;
    noteName: string;
    checkItemId: number;
    checkItemName: string;
    checkItemStatus: 'ready' | 'in_progress' | 'review' | 'done';
    checkItemDescription: string | null;
    checkItemIsArchived: boolean;
  }[];
};

@Injectable()
export class NoteService {
  constructor(
    private readonly archiveNoteTransactionScript: ArchiveNoteTransactionScript,
    private readonly convertChecklistToMemoTransactionScript: ConvertChecklistToMemoTransactionScript,
    private readonly getNoteByIdTransactionScript: GetNoteByIdTransactionScript,
    private readonly updateNoteTransactionScript: UpdateNoteTransactionScript,
    private readonly searchNotesTransactionScript: SearchNotesTransactionScript,
    private readonly createNoteTransactionScript: CreateNoteTransactionScript,
    private readonly updateNoteTitleTransactionScript: UpdateNoteTitleTransactionScript,
    private readonly moveNoteToFolderTransactionScript: MoveNoteToFolderTransactionScript,
    private readonly reorderNotesTransactionScript: ReorderNotesTransactionScript,
    private readonly getNoteNamesByUserIdTransactionScript: GetNoteNamesByUserIdTransactionScript,
    private readonly getNoteNamesForExplorerTransactionScript: GetNoteNamesForExplorerTransactionScript,
    private readonly eventEmitter: EventEmitter2,
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly getNoteVersionsTransactionScript: GetNoteVersionsTransactionScript,
    private readonly loadNoteVersionTransactionScript: LoadNoteVersionTransactionScript,
    private readonly checkItemsAggregator: CheckItemsAggregator
  ) {}

  async createNote(command: CreateNoteCommand): Promise<Note> {
    return this.createNoteTransactionScript.apply(command);
  }

  async updateNoteTitle(id: number, name: string, userId: number): Promise<{ id: number; name: string }> {
    return this.updateNoteTitleTransactionScript.apply(id, { name }, userId);
  }

  async moveNoteToFolder(
    noteId: number,
    userId: number,
    folderId: number | null
  ): Promise<Note> {
    return this.moveNoteToFolderTransactionScript.apply(noteId, userId, folderId);
  }

  async reorderNotes(input: ReorderNotesInput): Promise<void> {
    return this.reorderNotesTransactionScript.apply(input);
  }

  async getNoteNamesByUserId(params: GetNoteNamesQuery): Promise<GetNoteNamesResult> {
    return this.getNoteNamesByUserIdTransactionScript.apply(params);
  }

  async getNoteNamesForExplorer(userId: number, folderId?: string): Promise<NoteNameRow[]> {
    return this.getNoteNamesForExplorerTransactionScript.apply(userId, folderId);
  }

  async getNoteVersions(noteId: number, userId: number): Promise<NoteVersion[]> {
    return this.getNoteVersionsTransactionScript.apply(noteId, userId);
  }

  async loadNoteVersion(
    noteId: number,
    versionId: number,
    userId: number
  ): Promise<NoteWithCheckItems> {
    const version = await this.loadNoteVersionTransactionScript.apply(
      noteId,
      versionId,
      userId
    );
    return this.updateNoteWithCheckItems(
      noteId,
      { description: version.description, skipVersionCapture: true },
      userId
    );
  }

  async archiveNote(noteId: number, authUser: AuthUser): Promise<Note> {
    return await this.archiveNoteTransactionScript.apply(
      noteId,
      authUser.userId
    );
  }

  async convertChecklistToMemo(
    noteId: number,
    userId: number
  ): Promise<NoteWithCheckItems> {
    await this.convertChecklistToMemoTransactionScript.apply(noteId, userId);
    return this.getNoteByIdWithCheckItems(noteId, userId);
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

  async search(
    userId: number,
    query: string,
    options?: { includeArchived?: boolean }
  ): Promise<SearchResults> {
    const [noteMatches, checkItemMatches] = await Promise.all([
      this.searchNotesTransactionScript.apply(userId, query),
      this.checkItemsAggregator.searchByQuery(userId, query, options),
    ]);

    return { query, ...noteMatches, checkItemMatches };
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
