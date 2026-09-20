import { DataSource } from 'typeorm';
import { TagNote } from 'src/shared-kernel/domain/entities/tag-note.entity';
import { Tag } from 'src/tags/domain/entities/tag.entity';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('TagNote entity (integration)', () => {
  let dataSource: DataSource;
  let userId: number;
  let tag: Tag;
  let note: Note;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    userId = generateRandomNumbers(1000, 999999);

    const seededTag = new Tag();
    seededTag.name = 'tag';
    seededTag.userId = userId;
    tag = await dataSource.getRepository(Tag).save(seededTag);

    const seededNote = new Note();
    seededNote.name = 'note';
    seededNote.userId = userId;
    note = await dataSource.getRepository(Note).save(seededNote);
  });

  const seedTagNote = async (
    overrides: Partial<TagNote> = {}
  ): Promise<TagNote> => {
    const link = new TagNote();
    link.tagId = tag.id;
    link.noteId = note.id;
    Object.assign(link, overrides);
    return dataSource.getRepository(TagNote).save(link);
  };

  describe('save', () => {
    it('defaults archivedDate to null and stamps the timestamps', async () => {
      const link = await seedTagNote();

      const reloaded = await dataSource
        .getRepository(TagNote)
        .findOneBy({ id: link.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.tagId).toBe(tag.id);
      expect(reloaded?.noteId).toBe(note.id);
      expect(reloaded?.archivedDate).toBeNull();
      expect(reloaded?.createdAt).toBeInstanceOf(Date);
      expect(reloaded?.updatedAt).toBeInstanceOf(Date);
    });

    it('round-trips an explicit archivedDate', async () => {
      const archived = new Date('2026-09-01T12:00:00.000Z');
      const link = await seedTagNote({ archivedDate: archived });

      const reloaded = await dataSource
        .getRepository(TagNote)
        .findOneBy({ id: link.id });

      expect(reloaded?.archivedDate).not.toBeNull();
      expect(reloaded?.archivedDate?.toISOString()).toBe(
        archived.toISOString()
      );
    });
  });
});
