import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckItemService } from '../check-item.service';
import { CreateCheckItemTransactionScript } from '../../transaction-scripts/create-check-item-TS/create-check-item.transaction.script';
import { GetCheckItemTransactionScript } from '../../transaction-scripts/get-check-item-TS/get-check-item.transaction.script';
import { ToggleCheckItemTransactionScript } from '../../transaction-scripts/toggle-check-item-TS/toggle-check-item.transaction.script';
import { DeleteCheckItemTransactionScript } from '../../transaction-scripts/delete-check-item-TS/delete-check-item.transaction.script';
import { UpdateCheckItemTransactionScript } from '../../transaction-scripts/update-check-item-TS/update-check-item.transaction.script';
import { UpdateCheckItemStatusTransactionScript } from '../../transaction-scripts/update-check-item-status-TS/update-check-item-status.transaction.script';
import { GetCheckItemsByNoteTransactionScript } from '../../transaction-scripts/get-check-items-by-note-TS/get-check-items-by-note.transaction.script';
import { ReorderCheckItemsTransactionScript } from '../../transaction-scripts/reorder-check-items-TS/reorder-check-items.transaction.script';
import { AuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { CreateCheckItemDto } from '../../../apps/dtos/requests/create-check-item.dto';
import { ReorderCheckItemsDto } from '../../../apps/dtos/requests/reorder-check-items.dto';
import { CheckItem } from '../../entities/check-item.entity';
import { VERIFY_NOTE_ACCESS_COMMAND } from 'src/shared-kernel/domain/cross-domain-commands/notes/verify-note-access.command';
import {
  createMock,
  createMockWithApply,
  generateRandomNumbers,
} from 'src/shared-kernel/test-utils';

describe('CheckItemService', () => {
  let target: CheckItemService;
  let mockCreateCheckItemTS: jest.Mocked<CreateCheckItemTransactionScript>;
  let mockGetCheckItemTS: jest.Mocked<GetCheckItemTransactionScript>;
  let mockToggleCheckItemTS: jest.Mocked<ToggleCheckItemTransactionScript>;
  let mockDeleteCheckItemTS: jest.Mocked<DeleteCheckItemTransactionScript>;
  let mockUpdateCheckItemTS: jest.Mocked<UpdateCheckItemTransactionScript>;
  let mockUpdateCheckItemStatusTS: jest.Mocked<UpdateCheckItemStatusTransactionScript>;
  let mockGetCheckItemsByNoteTS: jest.Mocked<GetCheckItemsByNoteTransactionScript>;
  let mockReorderCheckItemsTS: jest.Mocked<ReorderCheckItemsTransactionScript>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let authUser: AuthUser;

  beforeEach(async () => {
    mockCreateCheckItemTS =
      createMockWithApply<CreateCheckItemTransactionScript>();
    mockGetCheckItemTS = createMockWithApply<GetCheckItemTransactionScript>();
    mockToggleCheckItemTS =
      createMockWithApply<ToggleCheckItemTransactionScript>();
    mockDeleteCheckItemTS =
      createMockWithApply<DeleteCheckItemTransactionScript>();
    mockUpdateCheckItemTS =
      createMockWithApply<UpdateCheckItemTransactionScript>();
    mockUpdateCheckItemStatusTS =
      createMockWithApply<UpdateCheckItemStatusTransactionScript>();
    mockGetCheckItemsByNoteTS =
      createMockWithApply<GetCheckItemsByNoteTransactionScript>();
    mockReorderCheckItemsTS =
      createMockWithApply<ReorderCheckItemsTransactionScript>();
    mockEventEmitter = createMock<EventEmitter2>({
      emitAsync: jest.fn().mockResolvedValue(undefined),
    });
    authUser = { userId: generateRandomNumbers(), username: 'test-user' };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckItemService,
        {
          provide: CreateCheckItemTransactionScript,
          useValue: mockCreateCheckItemTS,
        },
        {
          provide: GetCheckItemTransactionScript,
          useValue: mockGetCheckItemTS,
        },
        {
          provide: ToggleCheckItemTransactionScript,
          useValue: mockToggleCheckItemTS,
        },
        {
          provide: DeleteCheckItemTransactionScript,
          useValue: mockDeleteCheckItemTS,
        },
        {
          provide: UpdateCheckItemTransactionScript,
          useValue: mockUpdateCheckItemTS,
        },
        {
          provide: UpdateCheckItemStatusTransactionScript,
          useValue: mockUpdateCheckItemStatusTS,
        },
        {
          provide: GetCheckItemsByNoteTransactionScript,
          useValue: mockGetCheckItemsByNoteTS,
        },
        {
          provide: ReorderCheckItemsTransactionScript,
          useValue: mockReorderCheckItemsTS,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    target = moduleRef.get(CheckItemService);
  });

  describe('createCheckItem', () => {
    it('emits VERIFY_NOTE_ACCESS_COMMAND with the note id and numeric user id', async () => {
      const noteId = generateRandomNumbers(1000, 999999);
      const checkItem = new CreateCheckItemDto();
      checkItem.name = 'Buy milk';
      const dto = { authUser, checkItem, noteId };
      mockCreateCheckItemTS.apply.mockResolvedValue([]);

      await target.createCheckItem(dto);

      expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith(
        VERIFY_NOTE_ACCESS_COMMAND,
        { noteId, userId: authUser.userId }
      );
    });

    it('applies the transaction script with the mapped name and noteId only, and returns its result', async () => {
      const noteId = generateRandomNumbers(1000, 999999);
      const checkItem = new CreateCheckItemDto();
      checkItem.name = 'Buy milk';
      const dto = { authUser, checkItem, noteId };
      const expectedItems: CheckItem[] = [
        { id: generateRandomNumbers(), name: 'Buy milk', noteId } as CheckItem,
      ];
      mockCreateCheckItemTS.apply.mockResolvedValue(expectedItems);

      const result = await target.createCheckItem(dto);

      expect(mockCreateCheckItemTS.apply).toHaveBeenCalledTimes(1);
      expect(mockCreateCheckItemTS.apply).toHaveBeenCalledWith({
        name: 'Buy milk',
        noteId,
      });
      expect(result).toBe(expectedItems);
    });
  });

  describe('getCheckItemsByNoteId', () => {
    it('passes the note id and the numeric user id to the transaction script', async () => {
      const noteId = generateRandomNumbers(1000, 999999);
      const expectedItems: CheckItem[] = [];
      mockGetCheckItemsByNoteTS.apply.mockResolvedValue(expectedItems);

      const result = await target.getCheckItemsByNoteId(noteId, authUser);

      expect(mockGetCheckItemsByNoteTS.apply).toHaveBeenCalledTimes(1);
      expect(mockGetCheckItemsByNoteTS.apply).toHaveBeenCalledWith(
        noteId,
        authUser.userId
      );
      expect(result).toBe(expectedItems);
    });
  });

  describe('reorderCheckItems', () => {
    it('passes the note id, the numeric user id, and the dto to the transaction script', async () => {
      const noteId = generateRandomNumbers(1000, 999999);
      const dto = new ReorderCheckItemsDto();
      dto.checkItemIds = [
        generateRandomNumbers(),
        generateRandomNumbers(),
        generateRandomNumbers(),
      ];
      const expectedItems: CheckItem[] = [];
      mockReorderCheckItemsTS.apply.mockResolvedValue(expectedItems);

      const result = await target.reorderCheckItems(noteId, authUser, dto);

      expect(mockReorderCheckItemsTS.apply).toHaveBeenCalledTimes(1);
      expect(mockReorderCheckItemsTS.apply).toHaveBeenCalledWith(
        noteId,
        authUser.userId,
        dto
      );
      expect(result).toBe(expectedItems);
    });
  });
});
