-- Migration: Remove redundant date columns
-- This migration removes redundant date columns from tables that already have time-only columns
-- Date: 2025-11-03

-- Remove redundant date columns from scp_attendance table
-- Keep time columns: checked_in_time, started_time, completed_time, cancelled_time
-- Keep necessary date columns: cancelled_date (needed for cancellation tracking)
ALTER TABLE scp_attendance
DROP COLUMN IF EXISTS checked_in_date,
DROP COLUMN IF EXISTS started_date,
DROP COLUMN IF EXISTS completed_date;

-- Remove redundant date columns from scp_spiritual_treatment_record table
-- Keep only time columns: start_time, end_time
-- Remove date columns: treatment_start_date, treatment_end_date
ALTER TABLE scp_spiritual_treatment_record
DROP COLUMN IF EXISTS treatment_start_date,
DROP COLUMN IF EXISTS treatment_end_date;

-- Rename columns to remove redundant "treatment_" prefix in scp_spiritual_treatment_record
ALTER TABLE scp_spiritual_treatment_record
RENAME COLUMN treatment_start_time TO start_time;

ALTER TABLE scp_spiritual_treatment_record
RENAME COLUMN treatment_end_time TO end_time;

-- Remove redundant date columns from scp_treatment_session_records (if they exist)
-- Keep only time columns for session records
ALTER TABLE scp_treatment_session_records
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date;

-- Add comment explaining the time-only approach
COMMENT ON COLUMN scp_attendance.checked_in_time IS 'Check-in time (date derived from attendance context)';

COMMENT ON COLUMN scp_attendance.started_time IS 'Treatment start time (date derived from attendance context)';

COMMENT ON COLUMN scp_attendance.completed_time IS 'Treatment completion time (date derived from attendance context)';

COMMENT ON COLUMN scp_spiritual_treatment_record.start_time IS 'Treatment start time (date derived from attendance_date context)';

COMMENT ON COLUMN scp_spiritual_treatment_record.end_time IS 'Treatment end time (date derived from attendance_date context)';

COMMENT ON COLUMN scp_treatment_session_records.start_time IS 'Session start time (date derived from scheduled_date context)';

COMMENT ON COLUMN scp_treatment_session_records.end_time IS 'Session end time (date derived from scheduled_date context)';