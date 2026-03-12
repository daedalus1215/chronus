import { MigrationInterface, QueryRunner } from 'typeorm';

export class Drop_calendar_events_and_related_tables1773280562509
  implements MigrationInterface
{
  name = 'Drop_calendar_events_and_related_tables1773280562509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "event_reminders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recurrence_exceptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "calendar_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recurring_events"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "recurring_events" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "start_date" datetime NOT NULL,
        "end_date" datetime NOT NULL,
        "rrule" text NOT NULL,
        "color" varchar(7),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

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
        "color" varchar(7),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "recurrence_exceptions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "recurring_event_id" integer NOT NULL,
        "exception_date" date NOT NULL,
        "is_deleted" boolean NOT NULL DEFAULT 0,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "event_reminders" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "calendar_event_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "reminder_time" datetime NOT NULL,
        "sent_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
}
