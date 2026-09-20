import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { NoteService } from '../note.service';
import {
  createMock,
  createMockNote,
} from 'src/notes/test-utils/mock-factories';
import { NoteVersion } from 'src/notes/domain/entities/notes/note-version.entity';
import { ArchiveNoteTransactionScript } from 'src/notes/domain/transaction-scripts/archive-note-TS/archive-note.transaction.script';
import { ConvertChecklistToMemoTransactionScript } from 'src/notes/domain/transaction-scripts/convert-checklist-to-memo-TS/convert-checklist-to-memo.transaction.script';
import { GetNoteByIdTransactionScript } from 'src/notes/domain/transaction-scripts/get-note-by-id-TS/get-note-by-id.transaction.script';
import { UpdateNoteTransactionScript } from 'src/notes/domain/transaction-scripts/update-note-TS/update-note.transaction.script';
import { SearchNotesTransactionScript } from 'src/notes/domain/transaction-scripts/search-notes-TS/search-notes.transaction.script';
import { CreateNoteTransactionScript } from 'src/notes/domain/transaction-scripts/create-note-TS/create-note.transaction.script';
import { UpdateNoteTitleTransactionScript } from 'src/notes/domain/transaction-scripts/update-note-title-TS/update-note-title.transaction.script';
import { MoveNoteToFolderTransactionScript } from 'src/notes/domain/transaction-scripts/move-note-to-folder-TS/move-note-to-folder.transaction.script';
import { ReorderNotesTransactionScript } from 'src/notes/domain/transaction-scripts/reorder-notes-TS/reorder-notes.transaction.script';
import { GetNoteNamesByUserIdTransactionScript } from 'src/notes/domain/transaction-scripts/get-note-names-by-user-id-TS/get-note-names-by-user-id.transaction.script';
import { GetNoteNamesForExplorerTransactionScript } from 'src/notes/domain/transaction-scripts/get-note-names-for-explorer-TS/get-note-names-for-explorer.transaction.script';
import { DeleteNoteTransactionScript } from 'src/notes/domain/transaction-scripts/delete-note-TS/delete-note.transaction.script';
import { GetNoteVersionsTransactionScript } from 'src/notes/domain/transaction-scripts/get-note-versions-TS/get-note-versions.transaction.script';
import { LoadNoteVersionTransactionScript } from 'src/notes/domain/transaction-scripts/load-note-version-TS/load-note-version.transaction.script';
import { UpdateNoteTimestampTransactionScript } from 'src/notes/domain/transaction-scripts/update-note-timestamp-TS/update-note-timestamp.transaction.script';
import { CheckItemsAggregator } from 'src/check-items/domain/aggregators/check-items.aggregator';
import { DELETE_CHECK_ITEMS_BY_NOTE_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/check-items/delete-check-items-by-note.command';
import { DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/tags/delete-note-tag-associations.command';

describe('NoteService', () => {
  let service: NoteService;
  let mockGetNoteByIdTS: jest.Mocked<GetNoteByIdTransactionScript>;
  let mockUpdateNoteTS: jest.Mocked<UpdateNoteTransactionScript>;
  let mockDeleteNoteTS: jest.Mocked<DeleteNoteTransactionScript>;
  let mockLoadNoteVersionTS: jest.Mocked<LoadNoteVersionTransactionScript>;
  let mockEventEmitter: { emitAsync: jest.Mock };
  let mockCheckItemsAggregator: jest.Mocked<CheckItemsAggregator>;

  beforeEach(async () => {
    // Arrange
    mockGetNoteByIdTS = createMock<GetNoteByIdTransactionScript>({
      apply: jest.fn(),
    });
    mockUpdateNoteTS = createMock<UpdateNoteTransactionScript>({
      apply: jest.fn(),
    });
    mockDeleteNoteTS = createMock<DeleteNoteTransactionScript>({
      apply: jest.fn(),
    });
    mockLoadNoteVersionTS = createMock<LoadNoteVersionTransactionScript>({
      apply: jest.fn(),
    });
    mockEventEmitter = {
      emitAsync: jest.fn().mockResolvedValue(undefined),
    };
    mockCheckItemsAggregator = createMock<CheckItemsAggregator>({
      findByNoteId: jest.fn().mockResolvedValue([]),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        NoteService,
        { provide: ArchiveNoteTransactionScript, useValue: {} },
        {
          provide: ConvertChecklistToMemoTransactionScript,
          useValue: {},
        },
        { provide: GetNoteByIdTransactionScript, useValue: mockGetNoteByIdTS },
        { provide: UpdateNoteTransactionScript, useValue: mockUpdateNoteTS },
        {
          provide: SearchNotesTransactionScript,
          useValue: {},
        },
        { provide: CreateNoteTransactionScript, useValue: {} },
        { provide: UpdateNoteTitleTransactionScript, useValue: {} },
        { provide: MoveNoteToFolderTransactionScript, useValue: {} },
        { provide: ReorderNotesTransactionScript, useValue: {} },
        {
          provide: GetNoteNamesByUserIdTransactionScript,
          useValue: {},
        },
        {
          provide: GetNoteNamesForExplorerTransactionScript,
          useValue: {},
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: DeleteNoteTransactionScript, useValue: mockDeleteNoteTS },
        {
          provide: GetNoteVersionsTransactionScript,
          useValue: {},
        },
        {
          provide: LoadNoteVersionTransactionScript,
          useValue: mockLoadNoteVersionTS,
        },
        {
          provide: UpdateNoteTimestampTransactionScript,
          useValue: {},
        },
        {
          provide: CheckItemsAggregator,
          useValue: mockCheckItemsAggregator,
        },
      ],
    }).compile();

    service = moduleRef.get<NoteService>(NoteService);
  });

  describe('deleteNote', () => {
    it('should guard, emit cross-domain deletes, then delete the row in order', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockGetNoteByIdTS.apply.mockResolvedValue(createMockNote({ id: noteId }));
      mockDeleteNoteTS.apply.mockResolvedValue(undefined);

      // Act
      await service.deleteNote(noteId, userId);

      // Assert
      expect(mockGetNoteByIdTS.apply).toHaveBeenCalledWith(noteId, userId);
      expect(mockEventEmitter.emitAsync).toHaveBeenNthCalledWith(
        1,
        DELETE_NOTE_TAG_ASSOCIATIONS_COMMAND,
        { noteId, userId }
      );
      expect(mockEventEmitter.emitAsync).toHaveBeenNthCalledWith(
        2,
        DELETE_CHECK_ITEMS_BY_NOTE_COMMAND,
        { noteId, userId }
      );
      expect(mockDeleteNoteTS.apply).toHaveBeenCalledWith(noteId, userId);

      const guardOrder = mockGetNoteByIdTS.apply.mock.invocationCallOrder[0];
      const tagEventOrder =
        mockEventEmitter.emitAsync.mock.invocationCallOrder[0];
      const checkItemEventOrder =
        mockEventEmitter.emitAsync.mock.invocationCallOrder[1];
      const deleteOrder = mockDeleteNoteTS.apply.mock.invocationCallOrder[0];
      expect(guardOrder).toBeLessThan(tagEventOrder);
      expect(tagEventOrder).toBeLessThan(checkItemEventOrder);
      expect(checkItemEventOrder).toBeLessThan(deleteOrder);
    });

    it('should not emit events or delete when the note does not exist', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockGetNoteByIdTS.apply.mockRejectedValue(
        new NotFoundException('Note not found')
      );

      // Act / Assert
      await expect(service.deleteNote(noteId, userId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
      expect(mockDeleteNoteTS.apply).not.toHaveBeenCalled();
    });
  });

  describe('loadNoteVersion', () => {
    it('should restore the version description with version capture skipped', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const versionId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      const version: NoteVersion = {
        id: versionId,
        noteId,
        versionNum: 2,
        description: 'restored body',
        createdAt: new Date(),
      };
      const restoredNote = createMockNote({ id: noteId });
      const checkItems = [];
      mockLoadNoteVersionTS.apply.mockResolvedValue(version);
      mockUpdateNoteTS.apply.mockResolvedValue(restoredNote);
      mockCheckItemsAggregator.findByNoteId.mockResolvedValue(checkItems);

      // Act
      const result = await service.loadNoteVersion(noteId, versionId, userId);

      // Assert
      expect(mockLoadNoteVersionTS.apply).toHaveBeenCalledWith(
        noteId,
        versionId,
        userId
      );
      expect(mockUpdateNoteTS.apply).toHaveBeenCalledWith(
        noteId,
        { description: 'restored body', skipVersionCapture: true },
        userId
      );
      expect(result).toEqual({ note: restoredNote, checkItems });
    });

    it('should propagate the not-found error without updating the note', async () => {
      // Arrange
      const noteId = generateRandomNumbers();
      const versionId = generateRandomNumbers();
      const userId = generateRandomNumbers();
      mockLoadNoteVersionTS.apply.mockRejectedValue(
        new NotFoundException('Version not found')
      );

      // Act / Assert
      await expect(
        service.loadNoteVersion(noteId, versionId, userId)
      ).rejects.toThrow(NotFoundException);
      expect(mockUpdateNoteTS.apply).not.toHaveBeenCalled();
    });
  });
});
