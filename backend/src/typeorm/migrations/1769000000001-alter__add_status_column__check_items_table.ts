import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_addStatusColumn_checkItemsTable1769000000001
  implements MigrationInterface
{
  name = 'Alter_addStatusColumn_checkItemsTable1769000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer NOT NULL, "order" integer NOT NULL DEFAULT (0), "status" varchar(20) NOT NULL DEFAULT ('ready'))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", "status") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", CASE WHEN "done_date" IS NOT NULL THEN 'done' ELSE 'ready' END FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer NOT NULL, "order" integer NOT NULL DEFAULT (0))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
  }
}
