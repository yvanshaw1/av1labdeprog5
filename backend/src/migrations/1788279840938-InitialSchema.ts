import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788279840938 implements MigrationInterface {
    name = 'InitialSchema1788279840938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fornece uuid_generate_v4(), usado como default das chaves primarias.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "description" character varying(400), "price" numeric(10,2) NOT NULL, "duration_in_minutes" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_id" uuid NOT NULL, "service_id" uuid NOT NULL, "booked_price" numeric(10,2) NOT NULL, "booked_duration_in_minutes" integer NOT NULL, CONSTRAINT "PK_8356b5f1a1b0aa992c28b155d9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "license_plate" character varying(10) NOT NULL, "make" character varying(60) NOT NULL, "model" character varying(60) NOT NULL, "manufacture_year" integer NOT NULL, "color" character varying(40) NOT NULL, "client_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7e9fab2e8625b63613f67bd706c" UNIQUE ("license_plate"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(120) NOT NULL, "email" character varying(160) NOT NULL, "phone_number" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "scheduled_for" TIMESTAMP WITH TIME ZONE NOT NULL, "total_price" numeric(10,2) NOT NULL, "total_duration_in_minutes" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointment_items" ADD CONSTRAINT "FK_49e5e43f12dfe28e7308ae676ba" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment_items" ADD CONSTRAINT "FK_c5fee4f34f7f89bc0b5ce4ba464" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_4253172b7fcc8d1d90a6774502e" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_cd5792f585b901b5b379ccb8e67" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_cd5792f585b901b5b379ccb8e67"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_ccc5bbce58ad6bc96faa428b1e4"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_4253172b7fcc8d1d90a6774502e"`);
        await queryRunner.query(`ALTER TABLE "appointment_items" DROP CONSTRAINT "FK_c5fee4f34f7f89bc0b5ce4ba464"`);
        await queryRunner.query(`ALTER TABLE "appointment_items" DROP CONSTRAINT "FK_49e5e43f12dfe28e7308ae676ba"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TABLE "appointment_items"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
