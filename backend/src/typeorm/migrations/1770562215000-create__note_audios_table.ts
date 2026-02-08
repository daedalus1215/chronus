import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_NoteAudiosTable1770562215000 implements MigrationInterface {
  name = 'Create_NoteAudiosTable1770562215000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "note_audios" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
        "note_id" integer NOT NULL, 
        "file_path" text NOT NULL, 
        "file_name" text NOT NULL, 
        "file_format" varchar(10) NOT NULL,
        "created_at" text NOT NULL DEFAULT (datetime('now')), 
        "updated_at" text NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_note_audios_note_id" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE
      )`
    );

    // Create index on note_id for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_note_audios_note_id" ON "note_audios" ("note_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_note_audios_note_id"`);
    await queryRunner.query(`DROP TABLE "note_audios"`);
  }
}
