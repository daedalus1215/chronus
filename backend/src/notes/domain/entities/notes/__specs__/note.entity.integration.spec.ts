import { DataSource } from 'typeorm';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('Note entity (integration)', () => {
  let dataSource: DataSource;
  let userId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    userId = generateRandomNumbers(1000, 999999);
  });

  const seedNote = async (overrides: Partial<Note> = {}): Promise<Note> => {
    const note = new Note();
    note.name = 'note';
    note.userId = userId;
    Object.assign(note, overrides);
    return dataSource.getRepository(Note).save(note);
  };

  describe('save', () => {
    it('applies the DB defaults sortOrder 0 and archivedAt null when omitted', async () => {
      const note = await seedNote();

      const reloaded = await dataSource
        .getRepository(Note)
        .findOneBy({ id: note.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.sortOrder).toBe(0);
      expect(reloaded?.archivedAt).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('hides the note from normal finds', async () => {
      const note = await seedNote();

      await dataSource.getRepository(Note).softDelete({ id: note.id });

      const reloaded = await dataSource
        .getRepository(Note)
        .findOneBy({ id: note.id });

      expect(reloaded).toBeNull();
    });

    it('stamps archived_at, still visible through withDeleted', async () => {
      const note = await seedNote();

      await dataSource.getRepository(Note).softDelete({ id: note.id });

      const withDeleted = await dataSource
        .getRepository(Note)
        .findOne({ where: { id: note.id }, withDeleted: true });

      expect(withDeleted).not.toBeNull();
      expect(withDeleted?.archivedAt).toBeInstanceOf(Date);
    });
  });
});
