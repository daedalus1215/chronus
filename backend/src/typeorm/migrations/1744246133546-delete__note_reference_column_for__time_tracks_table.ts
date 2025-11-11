import { MigrationInterface, QueryRunner } from "typeorm";

export class Delete_noteReferenceColumnFor_timeTracksTable1744246133546 implements MigrationInterface {
    name = 'Delete_noteReferenceColumnFor_timeTracksTable1744246133546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "note" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "note", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "note", "createdAt", "updatedAt" FROM "time_track"`);
        await queryRunner.query(`DROP TABLE "time_track"`);
        await queryRunner.query(`ALTER TABLE "temporary_time_track" RENAME TO "time_track"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time_track" RENAME TO "temporary_time_track"`);
        await queryRunner.query(`CREATE TABLE "time_track" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" varchar NOT NULL, "noteId" integer NOT NULL, "noteReference" json, "date" date NOT NULL, "startTime" time NOT NULL, "durationMinutes" integer NOT NULL, "note" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "time_track"("id", "userId", "noteId", "date", "startTime", "durationMinutes", "note", "createdAt", "updatedAt") SELECT "id", "userId", "noteId", "date", "startTime", "durationMinutes", "note", "createdAt", "updatedAt" FROM "temporary_time_track"`);
        await queryRunner.query(`DROP TABLE "temporary_time_track"`);
    }

}
