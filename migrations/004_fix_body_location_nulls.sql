-- Migration: Fix null body_location values in treatment sessions
-- Date: 2025-09-17
-- Description: Update existing null body_location values with default values before schema sync

-- Step 1: Update all null body_location values with a default value
UPDATE scp_treatment_sessions
SET
    body_location = CASE
        WHEN treatment_type = 'light_bath' THEN 'Não especificado'
        WHEN treatment_type = 'rod' THEN 'Não especificado'
        ELSE 'Não especificado'
    END
WHERE
    body_location IS NULL;

-- Step 2: Make the column NOT NULL (this should now work since we've filled all nulls)
-- Note: TypeORM will handle this change automatically when you restart the server
-- ALTER TABLE scp_treatment_sessions ALTER COLUMN body_location SET NOT NULL;

-- Verification: Check that no null values remain
-- SELECT COUNT(*) as null_body_locations FROM scp_treatment_sessions WHERE body_location IS NULL;