-- Migration: Add comprehensive treatment tracking system (Backward Compatible)
-- Date: 2025-01-09
-- Description: Create treatment_sessions and treatment_session_records tables for enhanced lightbath/rod treatment tracking
-- Strategy: Additive changes only - existing tables remain unchanged

-- Create enum types for new tables
CREATE TYPE treatment_session_type AS ENUM ('light_bath', 'rod');

CREATE TYPE treatment_session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

CREATE TYPE session_record_status AS ENUM ('scheduled', 'completed', 'missed', 'cancelled');

-- Create treatment_sessions table
-- This table tracks planned treatment series (multiple sessions for lightbath/rod)
CREATE TABLE scp_treatment_sessions ( id SERIAL PRIMARY KEY,

-- Relationships to existing tables
treatment_record_id INTEGER NOT NULL REFERENCES scp_treatment_record (id) ON DELETE CASCADE,
attendance_id INTEGER NOT NULL REFERENCES scp_attendance (id) ON DELETE CASCADE,
patient_id INTEGER NOT NULL REFERENCES scp_patient (id) ON DELETE CASCADE,

-- Treatment details
treatment_type treatment_session_type NOT NULL,
body_location VARCHAR(100) NOT NULL,
start_date DATE NOT NULL,
planned_sessions INTEGER NOT NULL CHECK (
    planned_sessions > 0
    AND planned_sessions <= 50
),
completed_sessions INTEGER DEFAULT 0 CHECK (completed_sessions >= 0),
end_date DATE,
status treatment_session_status DEFAULT 'scheduled',

-- Light bath specific fields (required when treatment_type = 'light_bath')
duration_minutes INTEGER CHECK (
    duration_minutes IS NULL
    OR (
        duration_minutes > 0
        AND duration_minutes <= 70
    )
),
color VARCHAR(20),

-- General fields
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Constraints to ensure light bath has required fields
CONSTRAINT check_light_bath_requirements CHECK (
        (treatment_type = 'light_bath' AND duration_minutes IS NOT NULL AND color IS NOT NULL) OR
        (treatment_type = 'rod' AND duration_minutes IS NULL AND color IS NULL)
    )
);

-- Create treatment_session_records table
-- This table tracks individual sessions within a treatment series
CREATE TABLE scp_treatment_session_records (
    id SERIAL PRIMARY KEY,

-- Relationships
treatment_session_id INTEGER NOT NULL REFERENCES scp_treatment_sessions (id) ON DELETE CASCADE,
attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE SET NULL, -- Link to actual scheduled attendance

-- Session details
session_number INTEGER NOT NULL CHECK (session_number > 0),
scheduled_date DATE NOT NULL,
start_time TIMESTAMP,
end_time TIMESTAMP,
status session_record_status DEFAULT 'scheduled',

-- Additional tracking
notes TEXT,
missed_reason TEXT,
performed_by VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Ensure unique session numbers within a treatment session
UNIQUE(treatment_session_id, session_number) );

-- Create indexes for better performance
CREATE INDEX idx_treatment_sessions_treatment_record ON scp_treatment_sessions (treatment_record_id);

CREATE INDEX idx_treatment_sessions_attendance ON scp_treatment_sessions (attendance_id);

CREATE INDEX idx_treatment_sessions_patient ON scp_treatment_sessions (patient_id);

CREATE INDEX idx_treatment_sessions_status ON scp_treatment_sessions (status);

CREATE INDEX idx_treatment_sessions_start_date ON scp_treatment_sessions (start_date);

CREATE INDEX idx_treatment_sessions_type ON scp_treatment_sessions (treatment_type);

CREATE INDEX idx_treatment_session_records_session ON scp_treatment_session_records (treatment_session_id);

CREATE INDEX idx_treatment_session_records_attendance ON scp_treatment_session_records (attendance_id);

CREATE INDEX idx_treatment_session_records_scheduled_date ON scp_treatment_session_records (scheduled_date);

CREATE INDEX idx_treatment_session_records_status ON scp_treatment_session_records (status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treatment_sessions_updated_at 
    BEFORE UPDATE ON scp_treatment_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_session_records_updated_at 
    BEFORE UPDATE ON scp_treatment_session_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to automatically update completed_sessions count
CREATE OR REPLACE FUNCTION update_completed_sessions_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the count of completed sessions in the parent treatment_sessions table
    UPDATE scp_treatment_sessions 
    SET completed_sessions = (
        SELECT COUNT(*) 
        FROM scp_treatment_session_records 
        WHERE treatment_session_id = COALESCE(NEW.treatment_session_id, OLD.treatment_session_id)
        AND status = 'completed'
    ),
    -- Update status to completed if all sessions are done
    status = CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM scp_treatment_session_records 
            WHERE treatment_session_id = COALESCE(NEW.treatment_session_id, OLD.treatment_session_id)
            AND status = 'completed'
        ) >= planned_sessions THEN 'completed'
        WHEN (
            SELECT COUNT(*) 
            FROM scp_treatment_session_records 
            WHERE treatment_session_id = COALESCE(NEW.treatment_session_id, OLD.treatment_session_id)
            AND status = 'completed'
        ) > 0 THEN 'in_progress'
        ELSE status
    END,
    -- Set end_date when completed
    end_date = CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM scp_treatment_session_records 
            WHERE treatment_session_id = COALESCE(NEW.treatment_session_id, OLD.treatment_session_id)
            AND status = 'completed'
        ) >= planned_sessions AND end_date IS NULL THEN CURRENT_DATE
        ELSE end_date
    END
    WHERE id = COALESCE(NEW.treatment_session_id, OLD.treatment_session_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_completed_sessions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scp_treatment_session_records
    FOR EACH ROW EXECUTE FUNCTION update_completed_sessions_count();

-- Add comments for documentation
COMMENT ON TABLE scp_treatment_sessions IS 'Treatment session planning for lightbath and rod treatments - links to spiritual consultation outcomes';

COMMENT ON TABLE scp_treatment_session_records IS 'Individual session records for each planned treatment session';

COMMENT ON COLUMN scp_treatment_sessions.treatment_record_id IS 'Links to the spiritual consultation that recommended this treatment';

COMMENT ON COLUMN scp_treatment_sessions.attendance_id IS 'Links to the original spiritual consultation attendance';

COMMENT ON COLUMN scp_treatment_sessions.duration_minutes IS 'Duration in minutes for light bath (7min units: 1=7min, 2=14min, etc.)';

COMMENT ON COLUMN scp_treatment_sessions.color IS 'Color for light bath treatments only';

COMMENT ON COLUMN scp_treatment_sessions.planned_sessions IS 'Total number of sessions planned for this treatment';

COMMENT ON COLUMN scp_treatment_sessions.completed_sessions IS 'Number of sessions completed so far (auto-updated)';

COMMENT ON COLUMN scp_treatment_session_records.session_number IS 'Sequential number of this session within the treatment series (1, 2, 3, etc.)';

COMMENT ON COLUMN scp_treatment_session_records.attendance_id IS 'Links to the specific attendance when this session was performed';

COMMENT ON COLUMN scp_treatment_session_records.missed_reason IS 'Reason why session was missed (if applicable)';

COMMENT ON COLUMN scp_treatment_session_records.performed_by IS 'Staff member who performed the treatment';