import { DataSource } from 'typeorm';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import { NoteMemoTagRepository } from '../note-memo-tag.repository';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('NoteMemoTagRepository (integration)', () => {
  let dataSource: DataSource;
  let target: NoteMemoTagRepository;
  let ownerId: number;
  let otherUserId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
    target = new NoteMemoTagRepository(
      dataSource.getRepository(Note),
      dataSource.getRepository(Memo)
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

  const seedNote = async (overrides: Partial<Note> = {}): Promise<Note> => {
    const note = new Note();
    note.name = 'note';
    note.userId = ownerId;
    note.sortOrder = 0;
    Object.assign(note, overrides);
    return dataSource.getRepository(Note).save(note);
  };

  const setUpdatedAt = async (id: number, iso: string): Promise<void> => {
    await dataSource.query(
      `UPDATE "notes" SET "updated_at" = $1 WHERE "id" = $2`,
      [iso, id]
    );
  };

  describe('findById', () => {
    it('should return the note when it belongs to the user', async () => {
      // Arrange
      const note = await seedNote({ name: 'mine' });
      const memo = new Memo();
      memo.description = 'body';
      note.memo = memo;
      await target.save(note);

      // Act
      const found = await target.findById(note.id, ownerId);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.name).toBe('mine');
      expect(found?.memo?.description).toBe('body');
    });

    it('should return the note with a null memo when it has none', async () => {
      // Arrange
      const note = await seedNote({ name: 'plain' });

      // Act
      const found = await target.findById(note.id, ownerId);

      // Assert
      expect(found?.memo).toBeNull();
    });

    it("should return null for another user's note", async () => {
      // Arrange
      const note = await seedNote({ name: 'theirs', userId: otherUserId });

      // Act
      const found = await target.findById(note.id, ownerId);

      // Assert
      expect(found).toBeNull();
    });

    it('should return null for a missing id', async () => {
      // Act
      const found = await target.findById(987654, ownerId);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('should persist the memo and link it to the note', async () => {
      // Arrange
      const memo = new Memo();
      memo.description = 'real row';
      const note = await seedNote({ name: 'linked' });
      note.memo = memo;

      // Act
      const saved = await target.save(note);

      // Assert
      const memoRow = await dataSource
        .getRepository(Memo)
        .findOneBy({ description: 'real row' });
      expect(memoRow).not.toBeNull();
      expect(saved.memo?.id).toBe(memoRow?.id);
      const raw = await dataSource.query(
        `SELECT "memo_id" FROM "notes" WHERE "id" = $1`,
        [saved.id]
      );
      expect(raw[0].memo_id).toBe(memoRow?.id);
    });
  });

  describe('getNoteNamesByUserId', () => {
    it("should return only the user's notes ordered by updated_at desc", async () => {
      // Arrange
      const old = await seedNote({ name: 'old' });
      const middle = await seedNote({ name: 'middle' });
      const recent = await seedNote({ name: 'recent' });
      const theirs = await seedNote({ name: 'theirs', userId: otherUserId });
      await setUpdatedAt(old.id, '2026-09-18T10:00:01.000Z');
      await setUpdatedAt(middle.id, '2026-09-18T10:00:02.000Z');
      await setUpdatedAt(recent.id, '2026-09-18T10:00:03.000Z');
      await setUpdatedAt(theirs.id, '2026-09-18T10:00:09.000Z');

      // Act
      const rows = await target.getNoteNamesByUserId(
        ownerId,
        0,
        20,
        undefined,
        undefined,
        undefined
      );

      // Assert
      expect(rows.map(r => r.name)).toEqual(['recent', 'middle', 'old']);
    });

    it('should filter case-insensitively by name', async () => {
      // Arrange
      await seedNote({ name: 'Alpha' });
      await seedNote({ name: 'beta' });
      await seedNote({ name: 'gamma' });

      // Act
      const rows = await target.getNoteNamesByUserId(
        ownerId,
        0,
        20,
        'ALP',
        undefined,
        undefined
      );

      // Assert
      expect(rows.map(r => r.name)).toEqual(['Alpha']);
    });

    it('should return only memos when type is memo', async () => {
      // Arrange
      await seedNote({ name: 'checklist' });
      const memo = new Memo();
      memo.description = 'x';
      const memoNote = await seedNote({ name: 'memo' });
      memoNote.memo = memo;
      await target.save(memoNote);

      // Act
      const rows = await target.getNoteNamesByUserId(
        ownerId,
        0,
        20,
        undefined,
        'memo',
        undefined
      );

      // Assert
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('memo');
      expect(rows[0].isMemo).toBe(1);
    });

    it('should return only checklists when type is checklist', async () => {
      // Arrange
      await seedNote({ name: 'checklist' });
      const memo = new Memo();
      memo.description = 'x';
      const memoNote = await seedNote({ name: 'memo' });
      memoNote.memo = memo;
      await target.save(memoNote);

      // Act
      const rows = await target.getNoteNamesByUserId(
        ownerId,
        0,
        20,
        undefined,
        'checklist',
        undefined
      );

      // Assert
      expect(rows).toHaveLength(1);
      expect(rows[0].name).toBe('checklist');
      expect(rows[0].isMemo).toBe(0);
    });

    it('should return only notes carrying the tag', async () => {
      // Arrange
      const tagged = await seedNote({ name: 'tagged' });
      await seedNote({ name: 'untagged' });
      const [tagRow] = await dataSource.query(
        `INSERT INTO "tags" ("name", "user_id") VALUES ($1, $2) RETURNING "id"`,
        ['work', ownerId]
      );
      await dataSource.query(
        `INSERT INTO "tag_notes" ("tag_id", "notes_id") VALUES ($1, $2)`,
        [tagRow.id, tagged.id]
      );

      // Act
      const rows = await target.getNoteNamesByUserId(
        ownerId,
        0,
        20,
        undefined,
        undefined,
        String(tagRow.id)
      );

      // Assert
      expect(rows.map(r => r.name)).toEqual(['tagged']);
    });

    it('should paginate with cursor and limit', async () => {
      // Arrange
      const ids = [] as number[];
      for (let i = 0; i < 5; i++) {
        const note = await seedNote({ name: `n${i}` });
        await setUpdatedAt(note.id, `2026-09-18T10:00:0${i + 1}.000Z`);
        ids.push(note.id);
      }
      // updated_at ascending n0..n4 -> desc order n4,n3,n2,n1,n0

      // Act
      const pageOne = await target.getNoteNamesByUserId(
        ownerId,
        0,
        2,
        undefined,
        undefined,
        undefined
      );
      const lastPage = await target.getNoteNamesByUserId(
        ownerId,
        4,
        2,
        undefined,
        undefined,
        undefined
      );

      // Assert
      expect(pageOne.map(r => r.id)).toEqual([ids[4], ids[3]]);
      expect(lastPage.map(r => r.id)).toEqual([ids[0]]);
    });
  });

  describe('getNoteNamesForExplorer', () => {
    it('should return only folder-less notes in sort order for root', async () => {
      // Arrange
      await seedNote({ name: 'first', sortOrder: 1 });
      await seedNote({ name: 'second', sortOrder: 5 });
      await seedNote({ name: 'in-folder', folderId: 42, sortOrder: 0 });

      // Act
      const rows = await target.getNoteNamesForExplorer(ownerId, 'root');

      // Assert
      expect(rows.map(r => r.name)).toEqual(['first', 'second']);
      expect(rows.every(r => r.folderId === null)).toBe(true);
    });

    it("should return only the folder's notes for a folder id", async () => {
      // Arrange
      const folder = await seedNote({ name: 'in-folder', folderId: 42 });
      await seedNote({ name: 'root-note' });
      await seedNote({ name: 'other-folder', folderId: 43 });

      // Act
      const rows = await target.getNoteNamesForExplorer(ownerId, '42');

      // Assert
      expect(rows.map(r => r.id)).toEqual([folder.id]);
    });

    it("should return all of the user's notes without a folder filter", async () => {
      // Arrange
      await seedNote({ name: 'a' });
      await seedNote({ name: 'b', folderId: 42 });
      await seedNote({ name: 'c', userId: otherUserId });

      // Act
      const rows = await target.getNoteNamesForExplorer(ownerId);

      // Assert
      expect(rows.map(r => r.name).sort()).toEqual(['a', 'b']);
    });
  });

  describe('updateNoteTimestamp', () => {
    it('should update updated_at for the owner', async () => {
      // Arrange
      const note = await seedNote({ name: 'ts' });
      await setUpdatedAt(note.id, '2020-01-01T00:00:00.000Z');

      // Act
      const result = await target.updateNoteTimestamp(note.id, ownerId);

      // Assert
      expect(result.affected).toBe(1);
      const raw = await dataSource.query(
        `SELECT "updated_at" FROM "notes" WHERE "id" = $1`,
        [note.id]
      );
      expect(new Date(raw[0].updated_at).getTime()).toBeGreaterThan(
        new Date('2020-01-01T00:00:00.000Z').getTime()
      );
    });

    it("should leave another user's note untouched", async () => {
      // Arrange
      const note = await seedNote({ name: 'ts', userId: otherUserId });
      await setUpdatedAt(note.id, '2020-01-01T00:00:00.000Z');

      // Act
      const result = await target.updateNoteTimestamp(note.id, ownerId);

      // Assert
      expect(result.affected).toBe(0);
      const raw = await dataSource.query(
        `SELECT "updated_at" FROM "notes" WHERE "id" = $1`,
        [note.id]
      );
      expect(new Date(raw[0].updated_at).toISOString()).toBe(
        '2020-01-01T00:00:00.000Z'
      );
    });
  });

  describe('deleteNoteById', () => {
    it("should delete the owner's note", async () => {
      // Arrange
      const note = await seedNote({ name: 'doomed' });

      // Act
      await target.deleteNoteById(note.id, ownerId);

      // Assert
      const remaining = await dataSource
        .getRepository(Note)
        .findOneBy({ id: note.id });
      expect(remaining).toBeNull();
    });

    it("should not delete another user's note", async () => {
      // Arrange
      const note = await seedNote({ name: 'safe', userId: otherUserId });

      // Act
      await target.deleteNoteById(note.id, ownerId);

      // Assert
      const remaining = await dataSource
        .getRepository(Note)
        .findOneBy({ id: note.id });
      expect(remaining).not.toBeNull();
    });
  });
});
