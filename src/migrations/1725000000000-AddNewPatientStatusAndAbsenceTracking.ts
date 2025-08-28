import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewPatientStatusAndAbsenceTracking1725000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new patient status 'N' to the enum
    await queryRunner.query(`
      ALTER TYPE "treatment_status" ADD VALUE 'N';
    `);

    // Add missing_appointments_streak to patient table
    await queryRunner.query(`
      ALTER TABLE "scp_patient" 
      ADD COLUMN "missing_appointments_streak" integer DEFAULT 0;
    `);

    // Add absence tracking columns to attendance table
    await queryRunner.query(`
      ALTER TABLE "scp_attendance" 
      ADD COLUMN "is_absence" boolean DEFAULT false;
    `);

    await queryRunner.query(`
      ALTER TABLE "scp_attendance" 
      ADD COLUMN "absence_justified" boolean DEFAULT NULL;
    `);

    // Update existing patients with NULL treatment_status to 'T' (in treatment)
    await queryRunner.query(`
      UPDATE "scp_patient" 
      SET "treatment_status" = 'T' 
      WHERE "treatment_status" IS NULL;
    `);

    // Update default value for new patients to be 'N' (new patient)
    await queryRunner.query(`
      ALTER TABLE "scp_patient" 
      ALTER COLUMN "treatment_status" SET DEFAULT 'N';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert default value
    await queryRunner.query(`
      ALTER TABLE "scp_patient" 
      ALTER COLUMN "treatment_status" SET DEFAULT 'T';
    `);

    // Remove absence tracking columns
    await queryRunner.query(`
      ALTER TABLE "scp_attendance" 
      DROP COLUMN "absence_justified";
    `);

    await queryRunner.query(`
      ALTER TABLE "scp_attendance" 
      DROP COLUMN "is_absence";
    `);

    // Remove missing_appointments_streak column
    await queryRunner.query(`
      ALTER TABLE "scp_patient" 
      DROP COLUMN "missing_appointments_streak";
    `);

    // Note: Cannot easily remove enum value 'N' due to PostgreSQL limitations
    // This would require recreating the enum type, which is complex and risky
    console.warn('Cannot remove enum value N from treatment_status due to PostgreSQL limitations');
  }
}
