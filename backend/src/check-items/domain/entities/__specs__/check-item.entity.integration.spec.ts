import { DataSource } from 'typeorm';
import { CheckItem } from 'src/check-items/domain/entities/check-item.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('CheckItem entity (integration)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
  });

  const seedCheckItem = async (
    overrides: Partial<CheckItem> = {}
  ): Promise<CheckItem> => {
    const checkItem = new CheckItem();
    checkItem.name = 'Test item';
    checkItem.noteId = generateRandomNumbers(1000, 999999);
    Object.assign(checkItem, overrides);
    return dataSource.getRepository(CheckItem).save(checkItem);
  };

  describe('saving with only name and noteId', () => {
    it('applies the DB defaults for status and order', async () => {
      const saved = await seedCheckItem();

      const reloaded = await dataSource
        .getRepository(CheckItem)
        .findOneBy({ id: saved.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded!.status).toBe('ready');
      expect(reloaded!.order).toBe(0);
    });

    it('leaves doneDate and archiveDate null', async () => {
      const saved = await seedCheckItem();

      const reloaded = await dataSource
        .getRepository(CheckItem)
        .findOneBy({ id: saved.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded!.doneDate).toBeNull();
      expect(reloaded!.archiveDate).toBeNull();
    });
  });
});
