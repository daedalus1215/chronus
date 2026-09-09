import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_EventRemindersTable1768608478000
  implements MigrationInterface
{
  name = 'Create_EventRemindersTable1768608478000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_reminders" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "calendar_event_id" integer NOT NULL,
        "reminder_minutes" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_event_reminders_calendar_event_id" ON "event_reminders" ("calendar_event_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_event_reminders_calendar_event_id"`
    );
    await queryRunner.query(`DROP TABLE "event_reminders"`);
  }
}
