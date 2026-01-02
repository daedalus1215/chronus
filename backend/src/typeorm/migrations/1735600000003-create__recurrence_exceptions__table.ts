import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_recurrenceExceptions_table1735600000003
  implements MigrationInterface
{
  name = 'Create_recurrenceExceptions_table1735600000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "recurrence_exceptions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "recurring_event_id" integer NOT NULL,
        "exception_date" date NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_recurrence_exceptions_recurring_event_id" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_recurrence_exceptions_recurring_event_id_exception_date" UNIQUE ("recurring_event_id", "exception_date")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recurrence_exceptions_recurring_event_id" ON "recurrence_exceptions" ("recurring_event_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recurrence_exceptions_exception_date" ON "recurrence_exceptions" ("exception_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_recurrence_exceptions_exception_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_recurrence_exceptions_recurring_event_id"`,
    );
    await queryRunner.query(`DROP TABLE "recurrence_exceptions"`);
  }
}


