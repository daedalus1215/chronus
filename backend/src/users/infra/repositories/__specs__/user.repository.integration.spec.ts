import { DataSource } from 'typeorm';
import { User } from 'src/users/domain/entities/user.entity';
import { UserRepository } from '../user.repository';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('UserRepository (integration)', () => {
  let dataSource: DataSource;
  let target: UserRepository;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
    target = new UserRepository(dataSource.getRepository(User));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
  });

  const seedUser = async (username: string): Promise<User> => {
    const user = new User();
    user.username = username;
    user.password = 'hashed';
    user.email = `${username}@example.com`;
    return dataSource.getRepository(User).save(user);
  };

  describe('findByUsername', () => {
    it('returns the user when the username exists', async () => {
      const seeded = await seedUser('alice');

      const found = await target.findByUsername('alice');

      expect(found?.id).toBe(seeded.id);
      expect(found?.password).toBe('hashed');
    });

    it('returns null when the username is unknown', async () => {
      await seedUser('alice');

      expect(await target.findByUsername('bob')).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the user for a numeric id', async () => {
      const seeded = await seedUser('alice');

      const found = await target.findById(seeded.id);

      expect(found?.username).toBe('alice');
    });

    it('coerces a numeric string id to the same user', async () => {
      const seeded = await seedUser('alice');

      const found = await target.findById(String(seeded.id));

      expect(found?.id).toBe(seeded.id);
      expect(found?.username).toBe('alice');
    });

    it('pins bug: a non-numeric string id produces NaN and surfaces as a postgres QueryFailedError', async () => {
      // findById coerces with Number(id); for a non-numeric string that is
      // NaN, which TypeORM passes straight to postgres instead of returning
      // null — a 500-level failure where a 404/null would be expected.
      // Pinned as written, not fixed.
      await seedUser('alice');

      await expect(target.findById('not-a-number')).rejects.toThrow(
        'invalid input syntax for type integer'
      );
    });
  });

  describe('update', () => {
    it('persists the changes and returns the reloaded user', async () => {
      const seeded = await seedUser('alice');

      const updated = await target.update(seeded.id, {
        email: 'new@example.com',
      });

      expect(updated.id).toBe(seeded.id);
      expect(updated.email).toBe('new@example.com');
      expect(updated.username).toBe('alice');
    });

    it('throws when the id does not exist', async () => {
      await seedUser('alice');

      await expect(
        target.update(generateRandomNumbers(1000000, 9999999), {
          email: 'ghost@example.com',
        })
      ).rejects.toThrow('User not found after update');
    });
  });
});
