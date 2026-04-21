import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_add_folder_id_column_notes_table1775800000001
  implements MigrationInterface
{
  name = 'Alter_add_folder_id_column_notes_table1775800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN "folder_id" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notes_backup" AS
        SELECT id, created_at, updated_at, memo_id, name, user_id, archived_at
        FROM "notes"
    `);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "notes_backup" RENAME TO "notes"`);
  }
}
