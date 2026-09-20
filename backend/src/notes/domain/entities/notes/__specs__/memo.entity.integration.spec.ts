import { DataSource } from 'typeorm';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';

describe('Memo entity (integration)', () => {
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

  describe('save', () => {
    it('applies the DB default description empty string when omitted', async () => {
      const memo = await dataSource.getRepository(Memo).save(new Memo());

      const reloaded = await dataSource
        .getRepository(Memo)
        .findOneBy({ id: memo.id });

      expect(reloaded?.description).toBe('');
    });
  });
});
