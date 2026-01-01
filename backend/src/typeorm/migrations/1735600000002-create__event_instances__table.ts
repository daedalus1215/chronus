import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_eventInstances_table1735600000002
  implements MigrationInterface
{
  name = 'Create_eventInstances_table1735600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_instances" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "recurring_event_id" integer NOT NULL,
        "instance_date" date NOT NULL,
        "start_date" datetime NOT NULL,
        "end_date" datetime NOT NULL,
        "is_modified" boolean NOT NULL DEFAULT 0,
        "title_override" varchar(255),
        "description_override" text,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_event_instances_recurring_event_id" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_event_instances_recurring_event_id" ON "event_instances" ("recurring_event_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_event_instances_instance_date" ON "event_instances" ("instance_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_event_instances_instance_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_event_instances_recurring_event_id"`,
    );
    await queryRunner.query(`DROP TABLE "event_instances"`);
  }
}

