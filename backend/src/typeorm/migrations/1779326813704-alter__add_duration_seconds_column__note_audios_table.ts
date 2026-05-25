import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_AddDurationSecondsColumn_NoteAudiosTable1779326813704
  implements MigrationInterface
{
  name = 'Alter_AddDurationSecondsColumn_NoteAudiosTable1779326813704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_audios" ADD COLUMN "duration_seconds" REAL DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_audios" DROP COLUMN "duration_seconds"`
    );
  }
}
