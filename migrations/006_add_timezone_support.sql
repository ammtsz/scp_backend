-- Migration 006: Add Timezone Support
-- This migration adds timezone fields to support timezone-aware functionality
-- while keeping all existing date columns intact for backward compatibility

-- Add timezone column to patients table
-- Default to Brazil timezone since this is a Brazilian healthcare system
ALTER TABLE scp_patient
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';

-- Update existing patients to have the default timezone
-- This ensures all existing patients have a valid timezone
UPDATE scp_patient
SET
    timezone = 'America/Sao_Paulo'
WHERE
    timezone IS NULL;

-- Add optional timezone override to attendances table
-- This allows individual attendances to use a different timezone if needed
-- (for example, if a patient is traveling or has special circumstances)
ALTER TABLE scp_attendance ADD COLUMN timezone_override VARCHAR(50);

-- Add index on patient timezone for performance
CREATE INDEX idx_scp_patient_timezone ON scp_patient (timezone);

-- Add comment to document the purpose
COMMENT ON COLUMN scp_patient.timezone IS 'Patient timezone for scheduling and display purposes (IANA timezone format)';

COMMENT ON COLUMN scp_attendance.timezone_override IS 'Optional timezone override for specific attendances (IANA timezone format)';