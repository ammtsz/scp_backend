-- Phase 3 Migration: Add absence_notes field to attendance table
-- Add support for storing detailed notes about patient absences
-- Date: September 5, 2025

BEGIN;

-- Add absence_notes column to store specific notes about patient absences
ALTER TABLE scp_attendance
ADD COLUMN IF NOT EXISTS absence_notes TEXT DEFAULT NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN scp_attendance.absence_notes IS 'Notes explaining the reason for absence when marking attendance as missed';

COMMIT;