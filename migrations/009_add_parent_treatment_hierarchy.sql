-- Migration 009: Add parent/child hierarchy to spiritual treatment records
-- and remove incorrectly placed location/quantity fields

-- Step 1: Add parent_treatment_id to create treatment episode hierarchy
ALTER TABLE scp_spiritual_treatment_record
ADD COLUMN parent_treatment_id INTEGER;

-- Step 2: Add foreign key constraint to link to parent treatment
ALTER TABLE scp_spiritual_treatment_record
ADD CONSTRAINT fk_parent_treatment FOREIGN KEY (parent_treatment_id) REFERENCES scp_spiritual_treatment_record (id) ON DELETE SET NULL;

-- Step 3: Add index for performance on parent lookups
CREATE INDEX idx_spiritual_treatment_parent ON scp_spiritual_treatment_record (parent_treatment_id);

-- Step 4: Remove incorrectly placed fields that belong in treatment_sessions
-- These fields should be managed via the treatment_sessions table which already has:
-- - body_locations (for location data)
-- - planned_sessions (for quantity data)
ALTER TABLE scp_spiritual_treatment_record
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS custom_location,
DROP COLUMN IF EXISTS quantity;

-- Step 5: Enhance treatment_sessions table for better location handling
-- Add custom_location field to treatment_sessions where it belongs
ALTER TABLE scp_treatment_sessions ADD COLUMN custom_location TEXT;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN scp_spiritual_treatment_record.parent_treatment_id IS 'Links follow-up consultations to original treatment episode. NULL = main/first treatment';

COMMENT ON COLUMN scp_treatment_sessions.custom_location IS 'Custom body location when standard locations are not sufficient';

COMMENT ON COLUMN scp_treatment_sessions.body_locations IS 'Standard body locations for this treatment session';

COMMENT ON COLUMN scp_treatment_sessions.planned_sessions IS 'Number of sessions planned for this treatment (quantity)';

-- Step 7: Create helper function to find root treatment
CREATE OR REPLACE FUNCTION get_root_treatment_id(treatment_id INTEGER) 
RETURNS INTEGER AS $$
DECLARE
    current_id INTEGER := treatment_id;
    parent_id INTEGER;
BEGIN
    LOOP
        SELECT parent_treatment_id INTO parent_id 
        FROM scp_spiritual_treatment_record 
        WHERE id = current_id;
        
        IF parent_id IS NULL THEN
            RETURN current_id;
        END IF;
        
        current_id := parent_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_root_treatment_id (INTEGER) IS 'Returns the root (main) treatment ID for any treatment in the hierarchy';

-- Step 8: Create view for treatment episodes
CREATE OR REPLACE VIEW treatment_episodes AS
SELECT
    t1.id as root_treatment_id,
    t1.attendance_id as main_attendance_id,
    t1.notes as episode_notes,
    a1.scheduled_date as episode_start_date,
    COUNT(t2.id) + 1 as total_consultations,
    ARRAY_AGG(
        t2.id
        ORDER BY a2.scheduled_date
    ) FILTER (
        WHERE
            t2.id IS NOT NULL
    ) as followup_treatment_ids,
    MAX(a2.scheduled_date) as last_consultation_date,
    CASE
        WHEN MAX(t2.return_in_weeks) > 0
        OR t1.return_in_weeks > 0 THEN 'active'
        ELSE 'completed'
    END as episode_status
FROM
    scp_spiritual_treatment_record t1
    LEFT JOIN scp_attendance a1 ON t1.attendance_id = a1.id
    LEFT JOIN scp_spiritual_treatment_record t2 ON t2.parent_treatment_id = t1.id
    LEFT JOIN scp_attendance a2 ON t2.attendance_id = a2.id
WHERE
    t1.parent_treatment_id IS NULL -- Only root treatments
GROUP BY
    t1.id,
    t1.attendance_id,
    t1.notes,
    a1.scheduled_date;

COMMENT ON VIEW treatment_episodes IS 'Provides episode-level view of spiritual treatments with hierarchy information';