import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_add_sort_order_column_notes_table1775800000003
  implements MigrationInterface
{
  name = 'Alter_add_sort_order_column_notes_table1775800000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0`
    );

    // Populate sort_order based on created_at within each folder group
    await queryRunner.query(`
      UPDATE "notes"
      SET "sort_order" = (
        SELECT COUNT(*)
        FROM "notes" n2
        WHERE n2.user_id = "notes".user_id
          AND (
            (n2.folder_id IS NULL AND "notes".folder_id IS NULL)
            OR n2.folder_id = "notes".folder_id
          )
          AND n2.created_at <= "notes".created_at
      ) - 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notes_backup" AS
        SELECT id, created_at, updated_at, memo_id, name, user_id, archived_at, folder_id
        FROM "notes"
    `);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "notes_backup" RENAME TO "notes"`);
  }
}
