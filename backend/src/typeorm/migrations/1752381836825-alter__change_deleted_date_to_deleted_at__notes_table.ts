import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_ChangeDeletedDateToDeletedAt_NotesTable1752381836825 implements MigrationInterface {
    name = 'Alter_ChangeDeletedDateToDeletedAt_NotesTable1752381836825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_at" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_notes"("id", "name", "user_id", "memo_id", "archived_at", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at" FROM "notes"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "user_id" integer NOT NULL, "memo_id" integer, "archived_date" datetime, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_571a925e7a956c24701f01af899" UNIQUE ("memo_id"), CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "notes"("id", "name", "user_id", "memo_id", "archived_date", "created_at", "updated_at") SELECT "id", "name", "user_id", "memo_id", "archived_at", "created_at", "updated_at" FROM "temporary_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_notes"`);
    }

}
