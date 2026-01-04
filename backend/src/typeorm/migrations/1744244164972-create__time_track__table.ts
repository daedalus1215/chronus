import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_timeTrack_table1744244164972 implements MigrationInterface {
  name = 'Create_timeTrack_table1744244164972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "noteReference" json, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "note" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "time_track"`);
  }
}
