import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAddPinnedColumnsNotesTable1790301139081
  implements MigrationInterface
{
  name = 'AlterAddPinnedColumnsNotesTable1790301139081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD "pinned" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD "pinned_at" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN "pinned_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP COLUMN "pinned"`
    );
  }
}
