import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUserTable1742217583080 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                        isGenerated: false
                    },
                    {
                        name: "username",
                        type: "varchar",
                        length: "20",
                        isUnique: true
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "100"
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    }
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user")
    }
}
