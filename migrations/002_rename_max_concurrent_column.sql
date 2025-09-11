-- Migration: Rename max_concurrent_light_bath to max_concurrent_lightbath_rod
-- Date: 2025-09-11
-- Purpose: Better reflect that light bath and rod treatments share the same room/doctor

-- Rename the column to better reflect its purpose
ALTER TABLE schedule_settings
RENAME COLUMN max_concurrent_light_bath TO max_concurrent_lightbath_rod;

-- Add comment to clarify the purpose
COMMENT ON COLUMN schedule_settings.max_concurrent_lightbath_rod IS 'Maximum concurrent light bath and rod treatments (share same room/doctor)';