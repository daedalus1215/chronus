import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_allTables_columns1745033460745
  implements MigrationInterface
{
  name = 'Alter_allTables_columns1745033460745';

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
      `CREATE TABLE "temporary_note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "note_tags"`
    );
    await queryRunner.query(`DROP TABLE "note_tags"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_note_tags" RENAME TO "note_tags"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user"("id", "username", "password") SELECT "id", "username", "password" FROM "user"`
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tags" ("id" integer PRIMARY KEY, "name" text NOT NULL, "description" text DEFAULT (''), "user_id" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "tags"`
    );
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`ALTER TABLE "temporary_tags" RENAME TO "tags"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id") SELECT "id", "archived_date", "tag_id", "notes_id" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
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
      `CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user"("id", "username", "password") SELECT "id", "username", "password" FROM "user"`
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id") SELECT "id", "archived_date", "tag_id", "notes_id" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_memos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "description" text NOT NULL DEFAULT (''), "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_memos"("id", "description", "created_at", "updated_at") SELECT "id", "description", "created_at", "updated_at" FROM "memos"`
    );
    await queryRunner.query(`DROP TABLE "memos"`);
    await queryRunner.query(`ALTER TABLE "temporary_memos" RENAME TO "memos"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
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
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" varchar NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" varchar NOT NULL, "note_id" integer NOT NULL, "date" date NOT NULL, "start_time" time NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" varchar NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "tag_notes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_tag_notes" RENAME TO "tag_notes"`
    );
    await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
    await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_6fa35b8ead30ef28cc1ac377b21" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_898115de9eadba996d4323ff0b6" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "note_tags"`
    );
    await queryRunner.query(`DROP TABLE "note_tags"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_note_tags" RENAME TO "note_tags"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
    await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
    await queryRunner.query(
      `ALTER TABLE "note_tags" RENAME TO "temporary_note_tags"`
    );
    await queryRunner.query(
      `CREATE TABLE "note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "temporary_note_tags"`
    );
    await queryRunner.query(`DROP TABLE "temporary_note_tags"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_898115de9eadba996d4323ff0b" ON "note_tags" ("tag_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fa35b8ead30ef28cc1ac377b2" ON "note_tags" ("note_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" varchar NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
    await queryRunner.query(`DROP INDEX "IDX_898115de9eadba996d4323ff0b"`);
    await queryRunner.query(`DROP INDEX "IDX_6fa35b8ead30ef28cc1ac377b2"`);
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
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY, "name" text NOT NULL, "user_id" text NOT NULL, "memo_id" integer, "archived_date" text, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
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
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at") SELECT "id", "archived_date", "tag_id", "notes_id", "created_at", "updated_at" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "memos" RENAME TO "temporary_memos"`);
    await queryRunner.query(
      `CREATE TABLE "memos" ("id" integer PRIMARY KEY, "description" text DEFAULT (''), "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "memos"("id", "description", "created_at", "updated_at") SELECT "id", "description", "created_at", "updated_at" FROM "temporary_memos"`
    );
    await queryRunner.query(`DROP TABLE "temporary_memos"`);
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id") SELECT "id", "archived_date", "tag_id", "notes_id" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`
    );
    await queryRunner.query(
      `INSERT INTO "user"("id", "username", "password") SELECT "id", "username", "password" FROM "temporary_user"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user"`);
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
    await queryRunner.query(
      `ALTER TABLE "tag_notes" RENAME TO "temporary_tag_notes"`
    );
    await queryRunner.query(
      `CREATE TABLE "tag_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "archived_date" date NOT NULL, "tag_id" integer, "notes_id" integer, CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "tag_notes"("id", "archived_date", "tag_id", "notes_id") SELECT "id", "archived_date", "tag_id", "notes_id" FROM "temporary_tag_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tag_notes"`);
    await queryRunner.query(`ALTER TABLE "tags" RENAME TO "temporary_tags"`);
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" integer PRIMARY KEY, "name" text NOT NULL, "description" text DEFAULT (''), "user_id" text NOT NULL, "created_at" text NOT NULL, "updated_at" text NOT NULL)`
    );
    await queryRunner.query(
      `INSERT INTO "tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "temporary_tags"`
    );
    await queryRunner.query(`DROP TABLE "temporary_tags"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar(20) NOT NULL, "password" varchar(100) NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`
    );
    await queryRunner.query(
      `INSERT INTO "user"("id", "username", "password") SELECT "id", "username", "password" FROM "temporary_user"`
    );
    await queryRunner.query(`DROP TABLE "temporary_user"`);
    await queryRunner.query(
      `ALTER TABLE "note_tags" RENAME TO "temporary_note_tags"`
    );
    await queryRunner.query(
      `CREATE TABLE "note_tags" ("note_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "FK_898115de9eadba996d4323ff0b6" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_6fa35b8ead30ef28cc1ac377b21" FOREIGN KEY ("note_id") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("note_id", "tag_id"))`
    );
    await queryRunner.query(
      `INSERT INTO "note_tags"("note_id", "tag_id") SELECT "note_id", "tag_id" FROM "temporary_note_tags"`
    );
    await queryRunner.query(`DROP TABLE "temporary_note_tags"`);
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
