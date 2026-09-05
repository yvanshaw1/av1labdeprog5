import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788569946863 implements MigrationInterface {
    name = 'InitialSchema1788569946863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fornece uuid_generate_v4(), usado como default da chave primaria.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(120) NOT NULL, "email" character varying(160) NOT NULL, "phone_number" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
