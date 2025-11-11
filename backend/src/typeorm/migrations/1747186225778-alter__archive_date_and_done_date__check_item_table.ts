import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_archiveDateAndDoneDate_checkItemsTable1747186225778 implements MigrationInterface {
    name = 'Alter_archiveDateAndDoneDate_checkItemsTable1747186225778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, update existing NULL done_date values to a default date
        await queryRunner.query(`UPDATE "check_items" SET "done_date" = datetime('now') WHERE "done_date" IS NULL`);
        
        // Now proceed with the table alteration
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "note_id" integer, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "check_items" RENAME TO "temporary_check_items"`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "temporary_check_items"`);
        await queryRunner.query(`DROP TABLE "temporary_check_items"`);
        await queryRunner.query(`ALTER TABLE "check_items" RENAME TO "temporary_check_items"`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "note_id" integer, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id" FROM "temporary_check_items"`);
        await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    }

}
