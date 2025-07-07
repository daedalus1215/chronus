import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_archiveDateNullable_tagNotesTable1751857221649 implements MigrationInterface {
    name = 'Alter_archiveDateNullable_tagNotesTable1751857221649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`);
        await queryRunner.query(`DROP TABLE "tag_notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`);
        await queryRunner.query(`CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`);
        await queryRunner.query(`DROP TABLE "tag_notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`);
        await queryRunner.query(`CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
        await queryRunner.query(`ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`);
        await queryRunner.query(`CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    }

}
