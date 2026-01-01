import { MigrationInterface, QueryRunner } from "typeorm";

export class Drop_NamedIndexes_CalendarEventsTable1767237505513 implements MigrationInterface {
    name = 'Drop_NamedIndexes_CalendarEventsTable1767237505513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_calendar_events_date_range"`);
        await queryRunner.query(`DROP INDEX "idx_calendar_events_start_date"`);
        await queryRunner.query(`DROP INDEX "idx_calendar_events_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_calendar_events_user_id" ON "calendar_events" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_calendar_events_start_date" ON "calendar_events" ("start_date") `);
        await queryRunner.query(`CREATE INDEX "idx_calendar_events_date_range" ON "calendar_events" ("start_date", "end_date") `);
    }

}
