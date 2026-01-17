import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_addSentAtToEventRemindersTable1768612721000
  implements MigrationInterface
{
  name = 'Alter_addSentAtToEventRemindersTable1768612721000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "event_reminders" ADD COLUMN "sent_at" datetime
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "event_reminders" DROP COLUMN "sent_at"
    `);
  }
}
