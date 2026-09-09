import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialPostgres1788666418554 implements MigrationInterface {
    name = 'InitialPostgres1788666418554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "username" character varying(20) NOT NULL, "password" character varying(100) NOT NULL, "email" character varying(255), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "user_id" integer NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "memos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "description" text NOT NULL DEFAULT '', CONSTRAINT "PK_5f005ade603ff6ea114dcacde0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "user_id" integer NOT NULL, "archived_at" TIMESTAMP WITH TIME ZONE, "folder_id" integer, "sort_order" integer NOT NULL DEFAULT '0', "memo_id" integer, CONSTRAINT "REL_2d85c0c4df4bdc951cdd0f9465" UNIQUE ("memo_id"), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag_notes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tag_id" integer NOT NULL, "notes_id" integer NOT NULL, "archived_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_64fec53360cf1ff0439ae71c7e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "security_events" ("id" SERIAL NOT NULL, "event_type" character varying(50) NOT NULL, "metadata" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6fc100d6700780737348df0d3ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "folders" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "user_id" integer NOT NULL, "parent_id" integer, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "check_items" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "done_date" TIMESTAMP WITH TIME ZONE, "archived_date" TIMESTAMP WITH TIME ZONE, "note_id" integer NOT NULL, "order" integer NOT NULL DEFAULT '0', "status" character varying(20) NOT NULL DEFAULT 'ready', "description" text, CONSTRAINT "PK_ad9eb8118d7f89d5e58c5b60bd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "note_audios" ("id" SERIAL NOT NULL, "note_id" integer NOT NULL, "file_path" text NOT NULL, "file_name" text NOT NULL, "file_format" character varying(10) NOT NULL, "last_position_seconds" real, "duration_seconds" real, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_92f5829754088b9d2c36d0381c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "time_track" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "note_id" integer NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "duration_minutes" integer NOT NULL, "note" character varying, CONSTRAINT "PK_805fcb3111bbf0fdd4fd250e172" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "note_versions" ("id" SERIAL NOT NULL, "note_id" integer NOT NULL, "version_num" integer NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e8f8bdb9b26fa5486cf6aeeaf02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650" FOREIGN KEY ("memo_id") REFERENCES "memos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_notes" ADD CONSTRAINT "FK_2eae8872308f6e6997732458a2b" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_notes" ADD CONSTRAINT "FK_f74bd04a606f40e37991b74e125" FOREIGN KEY ("notes_id") REFERENCES "notes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tag_notes" DROP CONSTRAINT "FK_f74bd04a606f40e37991b74e125"`);
        await queryRunner.query(`ALTER TABLE "tag_notes" DROP CONSTRAINT "FK_2eae8872308f6e6997732458a2b"`);
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_2d85c0c4df4bdc951cdd0f94650"`);
        await queryRunner.query(`DROP TABLE "note_versions"`);
        await queryRunner.query(`DROP TABLE "time_track"`);
        await queryRunner.query(`DROP TABLE "note_audios"`);
        await queryRunner.query(`DROP TABLE "check_items"`);
        await queryRunner.query(`DROP TABLE "folders"`);
        await queryRunner.query(`DROP TABLE "security_events"`);
        await queryRunner.query(`DROP TABLE "tag_notes"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`DROP TABLE "memos"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
