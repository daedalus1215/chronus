import { DataSource } from 'typeorm';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import { CheckItemsRepository } from '../check-items.repository';
import { CheckItemsHydrator } from '../check-items.hydrator';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('CheckItemsRepository (integration)', () => {
  let dataSource: DataSource;
  let target: CheckItemsRepository;
  let ownerId: number;
  let otherUserId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
    target = new CheckItemsRepository(
      dataSource.getRepository(CheckItem),
      new CheckItemsHydrator()
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    ownerId = generateRandomNumbers(1000, 999999);
    otherUserId = generateRandomNumbers(1000000, 9999999);
  });

  const seedNote = async (userId: number, name = 'note'): Promise<Note> => {
    const note = new Note();
    note.name = name;
    note.userId = userId;
    note.sortOrder = 0;
    return dataSource.getRepository(Note).save(note);
  };

  const seedCheckItem = async (
    noteId: number,
    overrides: Partial<CheckItem> = {}
  ): Promise<CheckItem> => {
    const checkItem = new CheckItem();
    checkItem.name = 'item';
    checkItem.noteId = noteId;
    Object.assign(checkItem, overrides);
    return dataSource.getRepository(CheckItem).save(checkItem);
  };

  describe('findByIdWithNoteValidation', () => {
    it('returns the item when the note belongs to the user', async () => {
      const note = await seedNote(ownerId, 'My note');
      const saved = await seedCheckItem(note.id, {
        name: 'Buy milk',
        order: 2,
        status: 'in_progress',
      });

      const result = await target.findByIdWithNoteValidation(saved.id, ownerId);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(saved.id);
      expect(result!.name).toBe('Buy milk');
      expect(result!.noteId).toBe(note.id);
      expect(result!.order).toBe(2);
      expect(result!.status).toBe('in_progress');
      expect(result!.doneDate).toBeNull();
      expect(result!.archiveDate).toBeNull();
    });

    it('returns null when the note belongs to a different user', async () => {
      const note = await seedNote(otherUserId, 'other note');
      const saved = await seedCheckItem(note.id, { name: 'Buy milk' });

      const result = await target.findByIdWithNoteValidation(saved.id, ownerId);

      expect(result).toBeNull();
    });

    it('returns null when the item is archived', async () => {
      const note = await seedNote(ownerId, 'My note');
      const saved = await seedCheckItem(note.id, {
        name: 'Buy milk',
        archiveDate: new Date(),
      });

      const result = await target.findByIdWithNoteValidation(saved.id, ownerId);

      expect(result).toBeNull();
    });
  });

  describe('findByNoteIdWithUserValidation', () => {
    it('returns the note items in ascending order', async () => {
      const note = await seedNote(ownerId, 'My note');
      const first = await seedCheckItem(note.id, { name: 'first', order: 1 });
      const third = await seedCheckItem(note.id, { name: 'third', order: 3 });
      const second = await seedCheckItem(note.id, { name: 'second', order: 2 });

      const results = await target.findByNoteIdWithUserValidation(
        note.id,
        ownerId
      );

      expect(results.map(item => item.id)).toEqual([
        first.id,
        second.id,
        third.id,
      ]);
      expect(results.map(item => item.order)).toEqual([1, 2, 3]);
    });

    it('returns an empty array when the note belongs to a different user', async () => {
      const note = await seedNote(otherUserId, 'other note');
      await seedCheckItem(note.id, { name: 'hidden item' });

      const results = await target.findByNoteIdWithUserValidation(
        note.id,
        ownerId
      );

      expect(results).toEqual([]);
    });
  });

  describe('getMaxOrderByNoteId', () => {
    it('returns the maximum order of the note items', async () => {
      const note = await seedNote(ownerId, 'My note');
      await seedCheckItem(note.id, { order: 1 });
      await seedCheckItem(note.id, { order: 7 });
      await seedCheckItem(note.id, { order: 4 });

      const max = await target.getMaxOrderByNoteId(note.id);

      expect(max).toBe(7);
    });

    it('returns -1 when the note has no items', async () => {
      const note = await seedNote(ownerId, 'My note');

      const max = await target.getMaxOrderByNoteId(note.id);

      expect(max).toBe(-1);
    });
  });

  describe('getMinOrderByNoteId', () => {
    it('returns the minimum order of the note items', async () => {
      const note = await seedNote(ownerId, 'My note');
      await seedCheckItem(note.id, { order: 5 });
      await seedCheckItem(note.id, { order: 2 });
      await seedCheckItem(note.id, { order: 3 });

      const min = await target.getMinOrderByNoteId(note.id);

      expect(min).toBe(2);
    });

    it('returns 0 when the note has no items', async () => {
      const note = await seedNote(ownerId, 'My note');

      const min = await target.getMinOrderByNoteId(note.id);

      expect(min).toBe(0);
    });
  });

  describe('searchByQuery', () => {
    it('matches item names case-insensitively', async () => {
      const note = await seedNote(ownerId, 'My note');
      const match = await seedCheckItem(note.id, { name: 'Buy Groceries' });
      await seedCheckItem(note.id, { name: 'Call dentist' });

      const results = await target.searchByQuery(ownerId, 'groc');

      expect(results).toHaveLength(1);
      expect(results[0].checkItemId).toBe(match.id);
      expect(results[0].checkItemName).toBe('Buy Groceries');
      expect(results[0].noteId).toBe(note.id);
      expect(results[0].noteName).toBe('My note');
      expect(results[0].checkItemStatus).toBe('ready');
      expect(results[0].checkItemIsArchived).toBe(false);
    });

    it('matches item descriptions case-insensitively', async () => {
      const note = await seedNote(ownerId, 'My note');
      const match = await seedCheckItem(note.id, {
        name: 'Weekly chore',
        description: 'take out the recycling',
      });

      const results = await target.searchByQuery(ownerId, 'RECYCLING');

      expect(results).toHaveLength(1);
      expect(results[0].checkItemId).toBe(match.id);
      expect(results[0].checkItemName).toBe('Weekly chore');
      expect(results[0].checkItemDescription).toBe('take out the recycling');
    });

    it('excludes archived items by default', async () => {
      const note = await seedNote(ownerId, 'My note');
      const active = await seedCheckItem(note.id, { name: 'Active task' });
      await seedCheckItem(note.id, {
        name: 'Archived task',
        archiveDate: new Date(),
      });

      const results = await target.searchByQuery(ownerId, 'task');

      expect(results).toHaveLength(1);
      expect(results[0].checkItemId).toBe(active.id);
    });

    it('includes archived items with includeArchived and flags them as archived', async () => {
      const note = await seedNote(ownerId, 'My note');
      const archived = await seedCheckItem(note.id, {
        name: 'Archived task',
        archiveDate: new Date(),
      });
      const active = await seedCheckItem(note.id, { name: 'Active task' });

      const results = await target.searchByQuery(ownerId, 'task', {
        includeArchived: true,
      });

      expect(results).toHaveLength(2);
      expect(
        results.find(r => r.checkItemId === archived.id)!.checkItemIsArchived
      ).toBe(true);
      expect(
        results.find(r => r.checkItemId === active.id)!.checkItemIsArchived
      ).toBe(false);
    });

    it('never returns items whose note belongs to another user', async () => {
      const ownNote = await seedNote(ownerId, 'My note');
      const ownItem = await seedCheckItem(ownNote.id, { name: 'Visible task' });
      const otherNote = await seedNote(otherUserId, 'Other note');
      await seedCheckItem(otherNote.id, { name: 'Visible task' });

      const results = await target.searchByQuery(ownerId, 'visible task');

      expect(results).toHaveLength(1);
      expect(results[0].checkItemId).toBe(ownItem.id);
      expect(results[0].noteName).toBe('My note');
    });
  });
});
