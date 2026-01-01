import { MigrationInterface, QueryRunner } from "typeorm";

export class Create_calendar_events_table1767154145226 implements MigrationInterface {
  name = 'Create_calendar_events_table1767154145226'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "calendar_events" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "recurring_event_id" integer,
        "instance_date" date,
        "title" varchar(255) NOT NULL,
        "description" text,
        "start_date" datetime NOT NULL,
        "end_date" datetime NOT NULL,
        "is_modified" boolean DEFAULT 0,
        "title_override" varchar(255),
        "description_override" text,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_calendar_events_user_id" ON "calendar_events" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_calendar_events_start_date" ON "calendar_events" ("start_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_calendar_events_date_range" ON "calendar_events" ("start_date", "end_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_calendar_events_recurring_event_id" ON "calendar_events" ("recurring_event_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_calendar_events_instance_date" ON "calendar_events" ("instance_date")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_calendar_events_recurring_event_id_instance_date"
      ON "calendar_events" ("recurring_event_id", "instance_date")
      WHERE "recurring_event_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_calendar_events_recurring_event_id_instance_date"`);
    await queryRunner.query(`DROP INDEX "IDX_calendar_events_instance_date"`);
    await queryRunner.query(`DROP INDEX "IDX_calendar_events_recurring_event_id"`);
    await queryRunner.query(`DROP INDEX "IDX_calendar_events_date_range"`);
    await queryRunner.query(`DROP INDEX "IDX_calendar_events_start_date"`);
    await queryRunner.query(`DROP INDEX "IDX_calendar_events_user_id"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
  }
}

