import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_add_last_position_seconds_column_note_audios_table1779000000000
  implements MigrationInterface
{
  name =
    'Alter_add_last_position_seconds_column_note_audios_table1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_audios" ADD COLUMN "last_position_seconds" REAL DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_audios" REMOVE COLUMN "last_position_seconds`
    );
  }
}
