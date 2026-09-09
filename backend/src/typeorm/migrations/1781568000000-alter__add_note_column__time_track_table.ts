import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_AddNoteColumn_TimeTrackTable1781568000000
  implements MigrationInterface
{
  name = 'Alter_AddNoteColumn_TimeTrackTable1781568000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_track" ADD COLUMN "note" varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "time_track" DROP COLUMN "note"`);
  }
}
