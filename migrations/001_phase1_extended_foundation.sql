-- Phase 1 Extended: Foundation for MVP Center SCP Requirements
-- Migration: Add treatment status 'N', missing appointments tracking, absence management, and light bath colors
-- Date: 2025-08-28
-- Safe migration: All changes are additive with backward compatibility

BEGIN;

-- Step 1: Add new treatment status 'N' (New Patient)
-- This is safe because it only adds a new enum value
ALTER TYPE treatment_status ADD VALUE IF NOT EXISTS 'N';

-- Step 2: Add missing appointments tracking to patient table
-- Default 0 ensures existing patients have valid values
ALTER TABLE scp_patient
ADD COLUMN IF NOT EXISTS missing_appointments_streak INTEGER DEFAULT 0;

-- Step 3: Add absence tracking to attendance table
-- is_absence defaults to FALSE (existing appointments were not absences)
-- absence_justified defaults to NULL (only set when is_absence = TRUE)
ALTER TABLE scp_attendance
ADD COLUMN IF NOT EXISTS is_absence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS absence_justified BOOLEAN DEFAULT NULL;

-- Step 4: Add light bath color for therapeutic treatments
-- Optional field for enhanced treatment recording
ALTER TABLE scp_treatment_record
ADD COLUMN IF NOT EXISTS light_bath_color VARCHAR(20);

-- Step 5: Ensure all existing patients have the missing appointments streak set
-- This handles any edge cases where the default might not have been applied
UPDATE scp_patient
SET
    missing_appointments_streak = 0
WHERE
    missing_appointments_streak IS NULL;

-- Step 6: Set NOT NULL constraint after ensuring all values are set
ALTER TABLE scp_patient
ALTER COLUMN missing_appointments_streak
SET NOT NULL;

-- Step 7: Add helpful comments to the new columns
COMMENT ON COLUMN scp_patient.missing_appointments_streak IS 'Tracks consecutive missed appointments for priority management';

COMMENT ON COLUMN scp_attendance.is_absence IS 'TRUE if patient did not show up for appointment';

COMMENT ON COLUMN scp_attendance.absence_justified IS 'NULL for regular appointments, TRUE/FALSE for justified/unjustified absences';

COMMENT ON COLUMN scp_treatment_record.light_bath_color IS 'Color used in light bath treatment (azul, verde, amarelo, vermelho, violeta, branco, laranja)';

COMMIT;

-- Verification queries (run these after migration to verify success)
-- SELECT unnest(enum_range(NULL::treatment_status)) as available_statuses;
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'scp_patient' AND column_name = 'missing_appointments_streak';
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'scp_attendance' AND column_name IN ('is_absence', 'absence_justified');
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'scp_treatment_record' AND column_name = 'light_bath_color';