import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_add_sort_order_column_folders_table1775800000002
  implements MigrationInterface
{
  name = 'Alter_add_sort_order_column_folders_table1775800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "folders" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0`
    );

    // Populate sort_order based on created_at within each parent group
    await queryRunner.query(`
      UPDATE "folders"
      SET "sort_order" = (
        SELECT COUNT(*)
        FROM "folders" f2
        WHERE f2.user_id = "folders".user_id
          AND (
            (f2.parent_id IS NULL AND "folders".parent_id IS NULL)
            OR f2.parent_id = "folders".parent_id
          )
          AND f2.created_at <= "folders".created_at
      ) - 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "folders_backup" AS
        SELECT id, name, user_id, parent_id, created_at, updated_at
        FROM "folders"
    `);
    await queryRunner.query(`DROP TABLE "folders"`);
    await queryRunner.query(`ALTER TABLE "folders_backup" RENAME TO "folders"`);
  }
}
