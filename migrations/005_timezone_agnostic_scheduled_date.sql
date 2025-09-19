-- Migration: Convert scheduled_date from DATE to VARCHAR in treatment_session_records table
-- This change makes scheduled_date timezone-agnostic by storing it as a string in YYYY-MM-DD format

-- Step 1: Add new column with VARCHAR type
ALTER TABLE treatment_session_records
ADD COLUMN scheduled_date_new VARCHAR(10);

-- Step 2: Copy existing data, converting DATE to string format
UPDATE treatment_session_records
SET
    scheduled_date_new = scheduled_date::text
WHERE
    scheduled_date IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE treatment_session_records DROP COLUMN scheduled_date;

-- Step 4: Rename the new column to the original name
ALTER TABLE treatment_session_records
RENAME COLUMN scheduled_date_new TO scheduled_date;

-- Step 5: Add NOT NULL constraint if it was present before
-- (Uncomment if the original column had NOT NULL constraint)
-- ALTER TABLE treatment_session_records
-- ALTER COLUMN scheduled_date SET NOT NULL;