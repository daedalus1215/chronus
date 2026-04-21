import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_folders_table1775800000000 implements MigrationInterface {
  name = 'Create_folders_table1775800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "folders" (
        "id"         integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name"       varchar NOT NULL,
        "user_id"    integer NOT NULL,
        "parent_id"  integer,
        "created_at" text NOT NULL DEFAULT (datetime('now')),
        "updated_at" text NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "folders"`);
  }
}
