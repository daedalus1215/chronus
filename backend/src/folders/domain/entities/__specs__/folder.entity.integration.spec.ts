import { DataSource } from 'typeorm';
import { Folder } from 'src/folders/domain/entities/folder.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('Folder entity (integration)', () => {
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

  const saveFolder = async (
    overrides: Partial<Folder> = {}
  ): Promise<Folder> => {
    const folder = new Folder();
    folder.name = 'folder';
    folder.userId = userId;
    Object.assign(folder, overrides);
    return dataSource.getRepository(Folder).save(folder);
  };

  describe('save', () => {
    it('defaults sortOrder to 0 and parentId to null when omitted', async () => {
      const folder = await saveFolder();

      const reloaded = await dataSource
        .getRepository(Folder)
        .findOneBy({ id: folder.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.sortOrder).toBe(0);
      expect(reloaded?.parentId).toBeNull();
      expect(reloaded?.createdAt).toBeInstanceOf(Date);
      expect(reloaded?.updatedAt).toBeInstanceOf(Date);
    });

    it('round-trips an explicit sortOrder and parentId', async () => {
      const parent = await saveFolder();
      const folder = await saveFolder({ sortOrder: 7, parentId: parent.id });

      const reloaded = await dataSource
        .getRepository(Folder)
        .findOneBy({ id: folder.id });

      expect(reloaded?.sortOrder).toBe(7);
      expect(reloaded?.parentId).toBe(parent.id);
      expect(reloaded?.name).toBe('folder');
      expect(reloaded?.userId).toBe(userId);
    });
  });
});
