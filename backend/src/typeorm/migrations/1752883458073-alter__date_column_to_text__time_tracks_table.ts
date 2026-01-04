import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_DateColumnToText_TimeTracksTable1752883458073
  implements MigrationInterface
{
  name = 'Alter_DateColumnToText_TimeTracksTable1752883458073';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "note_id" integer NOT NULL, "date" text NOT NULL, "start_time" time NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "time_track"`
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
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "note_id" integer NOT NULL, "date" date NOT NULL, "start_time" time NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    await queryRunner.query(
      `ALTER TABLE "time_track" RENAME TO "temporary_time_track"`
    );
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer NOT NULL, "note_id" integer NOT NULL, "date" date NOT NULL, "start_time" time NOT NULL, "duration_minutes" integer NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `INSERT INTO "time_track"("id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at") SELECT "id", "user_id", "note_id", "date", "start_time", "duration_minutes", "created_at", "updated_at" FROM "temporary_time_track"`
    );
    await queryRunner.query(`DROP TABLE "temporary_time_track"`);
  }
}
