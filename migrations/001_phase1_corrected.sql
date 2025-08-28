-- Phase 1 Extended Migration: Add new fields to existing database
-- Corrected for actual database schema structure
-- Date: August 28, 2025

BEGIN;

-- Step 1: Add new treatment status 'N' (New Patient) to the correct enum
ALTER TYPE scp_patient_treatment_status_enum ADD VALUE IF NOT EXISTS 'N';

-- Step 2: Add missing appointments tracking to patient table
ALTER TABLE scp_patient
ADD COLUMN IF NOT EXISTS missing_appointments_streak INTEGER DEFAULT 0;

-- Step 3: Add absence tracking to attendance table
ALTER TABLE scp_attendance
ADD COLUMN IF NOT EXISTS is_absence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS absence_justified BOOLEAN DEFAULT NULL;

-- Step 4: Add light bath color for therapeutic treatments
ALTER TABLE scp_treatment_record
ADD COLUMN IF NOT EXISTS light_bath_color VARCHAR(20);

-- Step 5: Ensure all existing patients have the streak field set
UPDATE scp_patient
SET
    missing_appointments_streak = 0
WHERE
    missing_appointments_streak IS NULL;

-- Step 6: Make missing_appointments_streak NOT NULL after setting defaults
ALTER TABLE scp_patient
ALTER COLUMN missing_appointments_streak
SET NOT NULL;

COMMIT;

-- Success message
SELECT 'Phase 1 Extended migration completed successfully!' as result;