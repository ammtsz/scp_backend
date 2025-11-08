-- Migration: Add main_complaint column to spiritual_treatment_record table
-- Date: 2025-01-04
-- Description: Aligns database schema with TypeORM entity definition

-- Add main_complaint column to scp_spiritual_treatment_record table
ALTER TABLE scp_spiritual_treatment_record
ADD COLUMN main_complaint TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN scp_spiritual_treatment_record.main_complaint IS 'Main complaint from the patient during this specific consultation session';

-- Verify the column was added successfully
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE
    table_name = 'scp_spiritual_treatment_record'
    AND column_name = 'main_complaint';