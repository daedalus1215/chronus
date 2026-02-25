import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_SecurityEventsTable1771981543980
  implements MigrationInterface {
  name = 'Create_SecurityEventsTable1771981543980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "security_events" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "event_type" varchar(50) NOT NULL,
        "metadata" text,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('security_events');
  }
}
