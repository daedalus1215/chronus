import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_addDescriptionColumn_checkItemsTable1770946910474
  implements MigrationInterface {
  name = 'Alter_addDescriptionColumn_checkItemsTable1770946910474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer, "order" integer NOT NULL DEFAULT (0), "status" varchar(20) NOT NULL DEFAULT ('ready'), "description" text, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", "status") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", "status" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "check_items" RENAME TO "temporary_check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer, "order" integer NOT NULL DEFAULT (0), "status" varchar(20) NOT NULL DEFAULT ('ready'), CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", "status") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order", "status" FROM "temporary_check_items"`
    );
    await queryRunner.query(`DROP TABLE "temporary_check_items"`);
  }
}
