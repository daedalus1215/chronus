import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorColumnCalendarEventsAndRecurringEventsTables1771723962480
    implements MigrationInterface
{
  name = 'AddColorColumnCalendarEventsAndRecurringEventsTables1771723962480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "calendar_events" ADD COLUMN "color" varchar(20) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "recurring_events" ADD COLUMN "color" varchar(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recurring_events" DROP COLUMN "color"
    `);
    await queryRunner.query(`
      ALTER TABLE "calendar_events" DROP COLUMN "color"
    `);
  }
}
