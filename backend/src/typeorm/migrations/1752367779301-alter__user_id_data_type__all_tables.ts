import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_userIdDataTypeFor_AllTables1752367779301
  implements MigrationInterface
{
  name = 'Alter_userIdDataTypeFor_AllTables1752367779301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY, "name" text NOT NULL, "user_id" text NOT NULL, "memo_id" integer, "archived_date" text, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY, "user_id" text NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" text NOT NULL, "duration_minutes" integer NOT NULL, "note" text, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "note", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "note", "created_at", "updated_at" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_tags" ("id" integer PRIMARY KEY, "name" text NOT NULL, "description" text DEFAULT (''), "user_id" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "tags"`
    );
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`ALTER TABLE "temporary_tags" RENAME TO "tags"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY, "user_id" text NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" text NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL DEFAULT (''), "user_id" varchar NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "tags"`
    );
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`ALTER TABLE "temporary_tags" RENAME TO "tags"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_memos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "description" text NOT NULL DEFAULT (''), "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_memos"("id", "description", "created_at", "updated_at") SELECT "id", "description", "created_at", "updated_at" FROM "memos"`
    );
    await queryRunner.query(`DROP TABLE "memos"`);
    await queryRunner.query(`ALTER TABLE "temporary_memos" RENAME TO "memos"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer NOT NULL, "archived_date" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer NOT NULL, "notes_id" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "note_id" integer NOT NULL, "date" date NOT NULL, "start_time" time NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer NOT NULL, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "check_items"`
    );
    await queryRunner.query(`DROP TABLE "check_items"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_check_items" RENAME TO "check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer NOT NULL, "notes_id" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer NOT NULL, "notes_id" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
    await queryRunner.query(
      `ALTER TABLE "check_items" RENAME TO "temporary_check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer NOT NULL, "archived_date" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "temporary_check_items"`
    );
    await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY, "user_id" text NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" text NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY, "name" text NOT NULL, "user_id" text NOT NULL, "memo_id" integer, "archived_date" text, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
    await queryRunner.query(
      `ALTER TABLE "check_items" RENAME TO "temporary_check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime)`
    );
    await queryRunner.query(
      `INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "temporary_check_items"`
    );
    await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    await queryRunner.query(
      `ALTER TABLE "check_items" RENAME TO "temporary_check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "temporary_check_items"`
    );
    await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    await queryRunner.query(`ALTER TABLE "memos" RENAME TO "temporary_memos"`);
    await queryRunner.query(
      `CREATE TABLE "memos" ("id" integer PRIMARY KEY, "description" text DEFAULT (''), "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "memos"("id", "description", "created_at", "updated_at") SELECT "id", "description", "created_at", "updated_at" FROM "temporary_memos"`
    );
    await queryRunner.query(`DROP TABLE "temporary_memos"`);
    await queryRunner.query(`ALTER TABLE "tags" RENAME TO "temporary_tags"`);
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" integer PRIMARY KEY, "name" text NOT NULL, "description" text DEFAULT (''), "user_id" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "temporary_tags"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tags"`);
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" datetime, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY, "user_id" text NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" text NOT NULL, "duration_minutes" integer NOT NULL, "note" text, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(`ALTER TABLE "tags" RENAME TO "temporary_tags"`);
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" integer PRIMARY KEY, "name" text NOT NULL, "description" text DEFAULT (''), "user_id" text NOT NULL, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "temporary_tags"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tags"`);
    await queryRunner.query(
      `ALTER TABLE "check_items" RENAME TO "temporary_check_items"`
    );
    await queryRunner.query(
      `CREATE TABLE "check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "note_id" integer, "archived_date" datetime, CONSTRAINT "FK_969ca57b40e321337faef8574c6" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "check_items"("id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date") SELECT "id", "created_at", "updated_at", "name", "done_date", "note_id", "archived_date" FROM "temporary_check_items"`
    );
    await queryRunner.query(`DROP TABLE "temporary_check_items"`);
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY, "user_id" text NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" text NOT NULL, "duration_minutes" integer NOT NULL, "note" text, "created_at" text NOT NULL, "updated_at" text NOT NULL, CONSTRAINT "FK_0e85e50d61a4c8def2147f9e90b" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "note", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "note", "created_at", "updated_at" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY, "name" text NOT NULL, "user_id" text NOT NULL, "memo_id" integer, "archived_date" text, "created_at" text NOT NULL, "updated_at" text NOT NULL, CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
  }
}
