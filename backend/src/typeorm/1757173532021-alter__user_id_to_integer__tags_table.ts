import { MigrationInterface, QueryRunner } from "typeorm";

export class Alter_UserIdToInteger_TagsTable1757173532021 implements MigrationInterface {
    name = 'Alter_UserIdToInteger_TagsTable1757173532021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL DEFAULT (''), "user_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "tags"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`ALTER TABLE "temporary_tags" RENAME TO "tags"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" RENAME TO "temporary_tags"`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL DEFAULT (''), "user_id" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "tags"("id", "name", "description", "user_id") SELECT "id", "name", "description", "user_id" FROM "temporary_tags"`);
        await queryRunner.query(`DROP TABLE "temporary_tags"`);
    }
}