import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_addArchiveDateColumnTo_notesAndTimeTrackTables1745032847558
  implements MigrationInterface
{
  name = 'Alter_addArchiveDateColumnTo_notesAndTimeTrackTables1745032847558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "user_id" varchar NOT NULL, "archived_date" datetime, "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notes"("id", "createdAt", "updatedAt", "name", "user_id", "archived_date", "memo_id") SELECT "id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id" FROM "notes"`
    );
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt" FROM "time_track"`
    );
    await queryRunner.query(`DROP TABLE "time_track"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_time_track" RENAME TO "time_track"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "note" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "createdAt", "updatedAt" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT (datetime('now')), "updatedAt" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "user_id" varchar NOT NULL, "date" datetime, "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `INSERT INTO "notes"("id", "createdAt", "updatedAt", "name", "user_id", "date", "memo_id") SELECT "id", "createdAt", "updatedAt", "name", "user_id", "archived_date", "memo_id" FROM "temporary_notes"`
    );
    await queryRunner.query(`DROP TABLE "temporary_notes"`);
  }
}
