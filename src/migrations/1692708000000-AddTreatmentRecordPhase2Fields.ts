import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTreatmentRecordPhase2Fields1692708000000 implements MigrationInterface {
    name = 'AddTreatmentRecordPhase2Fields1692708000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add Phase 2 fields to scp_treatment_record table
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            ADD COLUMN "location" TEXT[] DEFAULT '{}',
            ADD COLUMN "custom_location" TEXT,
            ADD COLUMN "quantity" INTEGER DEFAULT 1,
            ADD COLUMN "treatment_start_time" TIMESTAMP,
            ADD COLUMN "treatment_end_time" TIMESTAMP
        `);

        // Add comments for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "scp_treatment_record"."location" IS 'Array of predefined treatment locations (e.g., Coronário, Lombar)';
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "scp_treatment_record"."custom_location" IS 'Custom treatment location if not in predefined list';
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "scp_treatment_record"."quantity" IS 'Number of treatment applications (1-10)';
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "scp_treatment_record"."treatment_start_time" IS 'Timestamp when treatment session started';
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "scp_treatment_record"."treatment_end_time" IS 'Timestamp when treatment session ended';
        `);

        // Add constraint to ensure quantity is between 1 and 10
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            ADD CONSTRAINT "ck_treatment_record_quantity" 
            CHECK ("quantity" >= 1 AND "quantity" <= 10)
        `);

        // Add constraint to ensure treatment_end_time is after treatment_start_time
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            ADD CONSTRAINT "ck_treatment_record_time_order" 
            CHECK ("treatment_start_time" IS NULL OR "treatment_end_time" IS NULL OR "treatment_end_time" > "treatment_start_time")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove constraints first
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            DROP CONSTRAINT IF EXISTS "ck_treatment_record_quantity"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            DROP CONSTRAINT IF EXISTS "ck_treatment_record_time_order"
        `);

        // Remove Phase 2 columns
        await queryRunner.query(`
            ALTER TABLE "scp_treatment_record" 
            DROP COLUMN "location",
            DROP COLUMN "custom_location",
            DROP COLUMN "quantity",
            DROP COLUMN "treatment_start_time",
            DROP COLUMN "treatment_end_time"
        `);
    }
}
