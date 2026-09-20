import { DataSource } from 'typeorm';
import { User } from 'src/users/domain/entities/user.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('User entity (integration)', () => {
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

  const saveUser = async (overrides: Partial<User> = {}): Promise<User> => {
    const user = new User();
    user.username = `u${generateRandomNumbers(1000, 999999)}`;
    user.password = 'hashed-password';
    Object.assign(user, overrides);
    return dataSource.getRepository(User).save(user);
  };

  describe('save', () => {
    it('round-trips username, password and email and stamps the timestamps', async () => {
      const user = await saveUser({ email: 'user@example.com' });

      const reloaded = await dataSource
        .getRepository(User)
        .findOneBy({ id: user.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.username).toBe(user.username);
      expect(reloaded?.password).toBe('hashed-password');
      expect(reloaded?.email).toBe('user@example.com');
      expect(reloaded?.createdAt).toBeInstanceOf(Date);
      expect(reloaded?.updatedAt).toBeInstanceOf(Date);
    });

    it('defaults email to null when omitted', async () => {
      const user = await saveUser();

      const reloaded = await dataSource
        .getRepository(User)
        .findOneBy({ id: user.id });

      expect(reloaded?.email).toBeNull();
    });

    it('rejects a duplicate username via the unique constraint', async () => {
      const first = new User();
      first.username = 'dupe-user';
      first.password = 'p1';
      await dataSource.getRepository(User).save(first);

      const second = new User();
      second.username = 'dupe-user';
      second.password = 'p2';

      await expect(dataSource.getRepository(User).save(second)).rejects.toThrow(
        /duplicate key/
      );
    });
  });
});
