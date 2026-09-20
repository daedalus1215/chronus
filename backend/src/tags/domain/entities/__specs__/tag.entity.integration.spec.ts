import { DataSource } from 'typeorm';
import { Tag } from '../tag.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';

describe('Tag entity (integration)', () => {
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

  describe('description column default', () => {
    it('should persist an empty string when description is omitted on save', async () => {
      const saved = await dataSource
        .getRepository(Tag)
        .save({ name: 'work', userId: 1234 });

      const reloaded = await dataSource
        .getRepository(Tag)
        .findOne({ where: { id: saved.id } });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.description).toBe('');
    });
  });
});
