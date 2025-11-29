import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_addOrderColumn_checkItemsTable1764445668087 implements MigrationInterface {
    name = 'Alter_addOrderColumn_checkItemsTable1764445668087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer NOT NULL, "order" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", "order") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id", 0 FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);

        // Set order based on created_at for existing items, grouped by note_id
        // This maintains the current ordering (newest first) for existing data
        await queryRunner.query(`
            UPDATE "check_items" 
            SET "order" = (
                SELECT COUNT(*) 
                FROM "check_items" c2 
                WHERE c2.note_id = "check_items".note_id 
                AND c2.created_at <= "check_items".created_at
            ) - 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_check_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" text NOT NULL DEFAULT (datetime('now')), "updated_at" text NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "done_date" datetime, "archived_date" datetime, "note_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_check_items"("id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id") SELECT "id", "created_at", "updated_at", "name", "done_date", "archived_date", "note_id" FROM "check_items"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_check_items" RENAME TO "check_items"`);
    }
}

