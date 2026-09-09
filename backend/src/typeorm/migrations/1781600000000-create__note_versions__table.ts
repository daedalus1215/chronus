import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_note_versions_table1781600000000
  implements MigrationInterface
{
  name = 'Create_note_versions_table1781600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "note_versions" (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id       INTEGER NOT NULL REFERENCES "notes"(id) ON DELETE CASCADE,
        version_num   INTEGER NOT NULL,
        description   TEXT NOT NULL,
        created_at    TEXT NOT NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_note_versions_note_id" ON "note_versions"(note_id)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_note_versions_version_num" ON "note_versions"(note_id, version_num DESC)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "note_versions"`);
  }
}
