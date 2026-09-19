import { DataSource } from 'typeorm';

/**
 * Test-database bootstrap for `*.integration.spec.ts` files.
 *
 * The connection defaults match docker-compose.test.yml at the repo root;
 * override with the usual DB_* env vars when pointing at another instance.
 */
const DB_HOST = process.env.DB_HOST ?? '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT ?? 5433);
const DB_NAME = process.env.DB_NAME ?? 'chronus_test';
const DB_USER = process.env.DB_USER ?? 'chronus';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'chronus_test';

/**
 * Every table created by the migration chain, child tables first so a plain
 * TRUNCATE list does not need CASCADE reasoning per table.
 * Keep in sync with src/typeorm/migrations.
 */
export const INTEGRATION_TABLES = [
  'note_versions',
  'time_track',
  'note_audios',
  'check_items',
  'folders',
  'security_events',
  'tag_notes',
  'notes',
  'memos',
  'tags',
  'user',
] as const;

/**
 * Creates and initializes a real DataSource against the test database,
 * running the same migration chain the app runs (migrationsRun, no
 * synchronize), so the schema under test is the production schema.
 */
export async function createIntegrationDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../typeorm/migrations/*{.ts,.js}'],
    migrationsRun: true,
    synchronize: false,
  });
  return dataSource.initialize();
}

/**
 * Wipes all application tables and restarts identity sequences so each test
 * starts from an empty, deterministically-numbered database.
 */
export async function truncateIntegrationTables(
  dataSource: DataSource
): Promise<void> {
  await dataSource.query(
    `TRUNCATE ${INTEGRATION_TABLES.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
  );
}
