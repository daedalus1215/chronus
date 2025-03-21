import { MigrationInterface, QueryRunner } from "typeorm";

export class Create_notesAndTag_tables21742273639022 implements MigrationInterface {
    name = 'Create_notesAndTag_tables21742273639022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "memos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "description" text NOT NULL DEFAULT (''))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL DEFAULT (''), "user_id" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "user_id" varchar NOT NULL, "date" datetime, "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"))`);
        await queryRunner.query(`CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer)`);
        await queryRunner.query(`CREATE TABLE "note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "username", "password", "createdAt", "updatedAt") SELECT "id", "username", "password", "createdAt", "updatedAt" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "user_id" varchar NOT NULL, "date" datetime, "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_notes"("id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id") SELECT "id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id" FROM "notes"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
        await queryRunner.query(`CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_tag_notes"("id", "createdAt", "updatedAt", "archived_date", "tag_id", "notes_id") SELECT "id", "createdAt", "updatedAt", "archived_date", "tag_id", "notes_id" FROM "tag_notes"`);
        await queryRunner.query(`DROP TABLE "tag_notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`);
        await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
        await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
        await queryRunner.query(`CREATE TABLE "temporary_note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_6fa35b8ead30ef28cc1ac377b21" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_898115de9eadba996d4323ff0b6" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("note_id", "tag_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "note_tags"`);
        await queryRunner.query(`DROP TABLE "note_tags"`);
        await queryRunner.query(`ALTER TABLE "temporary_note_tags" RENAME TO "note_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
        await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
        await queryRunner.query(`ALTER TABLE "note_tags" RENAME TO "temporary_note_tags"`);
        await queryRunner.query(`CREATE TABLE "note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`);
        await queryRunner.query(`INSERT INTO "note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "temporary_note_tags"`);
        await queryRunner.query(`DROP TABLE "temporary_note_tags"`);
        await queryRunner.query(`CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `);
        await queryRunner.query(`ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`);
        await queryRunner.query(`CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer)`);
        await queryRunner.query(`INSERT INTO "tag_notes"("id", "createdAt", "updatedAt", "archived_date", "tag_id", "notes_id") SELECT "id", "createdAt", "updatedAt", "archived_date", "tag_id", "notes_id" FROM "temporary_tag_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
        await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "user_id" varchar NOT NULL, "date" datetime, "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"))`);
        await queryRunner.query(`INSERT INTO "notes"("id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id") SELECT "id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id" FROM "temporary_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_notes"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "user"("id", "username", "password", "createdAt", "updatedAt") SELECT "id", "username", "password", "createdAt", "updatedAt" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
        await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
        await queryRunner.query(`DROP TABLE "note_tags"`);
        await queryRunner.query(`DROP TABLE "tag_notes"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "memos"`);
    }

}
