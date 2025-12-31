import { MigrationInterface, QueryRunner } from "typeorm";

export class Create_calendar_events_table1767154145226 implements MigrationInterface {
  name = 'Create_calendar_events_table1767154145226'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "calendar_events" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "start_date" datetime NOT NULL,
        "end_date" datetime NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_calendar_events_user_id" ON "calendar_events" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_calendar_events_start_date" ON "calendar_events" ("start_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_calendar_events_date_range" ON "calendar_events" ("start_date", "end_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_calendar_events_date_range"`);
    await queryRunner.query(`DROP INDEX "idx_calendar_events_start_date"`);
    await queryRunner.query(`DROP INDEX "idx_calendar_events_user_id"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
  }
}

