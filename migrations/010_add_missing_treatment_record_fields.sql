-- Migration 010: Add missing fields to spiritual treatment record table
-- Date: 2025-11-03
-- Description: Add main_complaint and treatment_status columns to scp_spiritual_treatment_record
-- These fields are present in the TypeORM entity but missing from the database

BEGIN;

-- Add main_complaint column for per-consultation complaint tracking
ALTER TABLE scp_spiritual_treatment_record
ADD COLUMN main_complaint TEXT;

-- Add treatment_status column for tracking patient status at time of consultation
ALTER TABLE scp_spiritual_treatment_record
ADD COLUMN treatment_status VARCHAR(1);

-- Add comment for documentation
COMMENT ON COLUMN scp_spiritual_treatment_record.main_complaint IS 'Specific complaint for this consultation - enables historical tracking';

COMMENT ON COLUMN scp_spiritual_treatment_record.treatment_status IS 'Patient treatment status at time of consultation: N=New, T=Treatment, A=Discharged, F=Missed';

-- Add check constraint for treatment_status
ALTER TABLE scp_spiritual_treatment_record
ADD CONSTRAINT check_treatment_status CHECK (
    treatment_status IS NULL
    OR treatment_status IN ('N', 'T', 'A', 'F')
);

-- Create index for better performance on treatment_status queries
CREATE INDEX idx_spiritual_treatment_status ON scp_spiritual_treatment_record (treatment_status);

COMMIT;

-- Verification queries
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'scp_spiritual_treatment_record'
-- AND column_name IN ('main_complaint', 'treatment_status')
-- ORDER BY column_name;