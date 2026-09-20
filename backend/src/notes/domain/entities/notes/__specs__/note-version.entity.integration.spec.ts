import { DataSource } from 'typeorm';
import { NoteVersion } from 'src/notes/domain/entities/notes/note-version.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('NoteVersion entity (integration)', () => {
  let dataSource: DataSource;
  let noteId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    noteId = generateRandomNumbers(1000, 999999);
  });

  const saveVersion = async (
    overrides: Partial<NoteVersion> = {}
  ): Promise<NoteVersion> => {
    const version = new NoteVersion();
    version.noteId = noteId;
    version.versionNum = 1;
    version.description = 'initial content';
    Object.assign(version, overrides);
    return dataSource.getRepository(NoteVersion).save(version);
  };

  describe('save', () => {
    it('round-trips noteId, versionNum and description and stamps createdAt', async () => {
      const version = await saveVersion({
        versionNum: 4,
        description: 'edited body',
      });

      const reloaded = await dataSource
        .getRepository(NoteVersion)
        .findOneBy({ id: version.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.noteId).toBe(noteId);
      expect(reloaded?.versionNum).toBe(4);
      expect(reloaded?.description).toBe('edited body');
      expect(reloaded?.createdAt).toBeInstanceOf(Date);
    });
  });
});
