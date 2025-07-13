import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_renameNoteIdToNoteIdColumnFor_CheckItemsTable1747013126049 implements MigrationInterface {
    name = 'Alter_renameNoteIdToNoteIdColumnFor_CheckItemsTable1747013126049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "noteId" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "note_id" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "note_id" integer, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "check_items" RENAME TO "temporary_check_items"`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "note_id" integer)`);
        await queryRunner.query(`INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id" FROM "temporary_check_items"`);
        await queryRunner.query(`DROP TABLE "temporary_check_items"`);
        await queryRunner.query(`ALTER TABLE "check_items" RENAME TO "temporary_check_items"`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "noteId" integer)`);
        await queryRunner.query(`INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "note_id" FROM "temporary_check_items"`);
        await queryRunner.query(`DROP TABLE "temporary_check_items"`);
        await queryRunner.query(`ALTER TABLE "check_items" RENAME TO "temporary_check_items"`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime NOT NULL, "archive_date" datetime NOT NULL, "noteId" integer, CONSTRAINT "FK_4d80f5a9e5026cb2b4c158edcba" FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId") SELECT "id", "created_at", "updated_at", "name", "done_date", "archive_date", "noteId" FROM "temporary_check_items"`);
        await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    }

}
