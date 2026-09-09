import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_addEmailToUsersTable1768612674000
  implements MigrationInterface
{
  name = 'Alter_addEmailToUsersTable1768612674000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN "email" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "email"
    `);
  }
}
