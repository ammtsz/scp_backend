-- Timezone-Agnostic Database Schema Migration
-- This script converts all TIMESTAMP columns to separate DATE and TIME columns
-- to eliminate timezone-related issues.

-- Step 1: Create new init.sql with timezone-agnostic schema
-- PostgreSQL schema for SCP (Spiritual Center Project) - Timezone Agnostic Version
-- This schema manages patient records, attendances, treatments, and scheduling
-- All dates stored as DATE type, all times as TIME type - no timezone dependencies
-- Version: 3.0 (Timezone Agnostic)
-- Last Updated: 2025-09-18

-- Domain Types (unchanged)
CREATE TYPE PATIENT_PRIORITY AS ENUM (
    '1', -- Emergency: Requires immediate attention
    '2', -- Intermediate: Priority but not urgent
    '3'  -- Normal: Standard priority level
);

CREATE TYPE TREATMENT_STATUS AS ENUM (
    'N',  -- Novo paciente (New patient)
    'T',  -- Em tratamento (Under treatment)
    'A',  -- Alta médica espiritual (Spiritual medical discharge)
    'F'   -- Faltas consecutivas (Consecutive absences)
);

CREATE TYPE ATTENDANCE_TYPE AS ENUM (
    'spiritual',   -- Spiritual consultation
    'light_bath',  -- Light therapy treatment
    'rod'         -- Rod therapy treatment
);

CREATE TYPE ATTENDANCE_STATUS AS ENUM (
    'scheduled',   -- Appointment is scheduled
    'checked_in',  -- Patient has arrived
    'in_progress', -- Treatment is ongoing
    'completed',   -- Treatment is finished
    'cancelled',   -- Appointment was cancelled
    'missed'       -- Patient missed the appointment
);

CREATE TYPE TREATMENT_SESSION_TYPE AS ENUM (
    'light_bath',  -- Light therapy treatment sessions
    'rod'          -- Rod therapy treatment sessions
);

CREATE TYPE TREATMENT_SESSION_STATUS AS ENUM (
    'scheduled',   -- Treatment series is scheduled
    'in_progress', -- Treatment series is ongoing
    'completed',   -- Treatment series is completed
    'cancelled'    -- Treatment series was cancelled
);

CREATE TYPE SESSION_RECORD_STATUS AS ENUM (
    'scheduled',   -- Session is scheduled
    'completed',   -- Session was completed
    'missed',      -- Session was missed
    'cancelled'    -- Session was cancelled
);

-- Core patient information (updated with timezone-agnostic timestamps)
CREATE TABLE scp_patient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    priority PATIENT_PRIORITY DEFAULT '3',
    treatment_status TREATMENT_STATUS DEFAULT 'N',
    birth_date DATE,
    main_complaint TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    discharge_date DATE,
    missing_appointments_streak INTEGER DEFAULT 0,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

-- Timezone-agnostic audit fields
created_date DATE DEFAULT CURRENT_DATE,
created_time TIME DEFAULT CURRENT_TIME,
updated_date DATE DEFAULT CURRENT_DATE,
updated_time TIME DEFAULT CURRENT_TIME,

-- Validation constraints
CONSTRAINT valid_phone CHECK (phone ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$'),
    CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE)
);

-- Patient notes for storing detailed observations and treatment notes
CREATE TABLE scp_patient_note (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    note_content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',

-- Timezone-agnostic audit fields following the existing pattern
created_date DATE DEFAULT CURRENT_DATE,
created_time TIME DEFAULT CURRENT_TIME,
updated_date DATE DEFAULT CURRENT_DATE,
updated_time TIME DEFAULT CURRENT_TIME,

-- Foreign key constraint
CONSTRAINT fk_patient_note_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES scp_patient(id) 
        ON DELETE CASCADE
);

-- Medical attendance records (updated with timezone-agnostic timestamps)
CREATE TABLE scp_attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES scp_patient (id) ON DELETE CASCADE,
    type ATTENDANCE_TYPE NOT NULL,
    status ATTENDANCE_STATUS DEFAULT 'scheduled',

-- Scheduled date/time (already timezone-agnostic)
scheduled_date DATE NOT NULL, scheduled_time TIME NOT NULL,

-- Event timestamps converted to separate date/time fields
checked_in_time TIME,
started_time TIME,
completed_time TIME,
cancelled_date DATE,
cancelled_time TIME,

-- Other fields
absence_justified BOOLEAN DEFAULT NULL,
absence_notes TEXT,
notes TEXT,
timezone_override VARCHAR(50),

-- Timezone-agnostic audit fields
created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME
);

-- Spiritual treatment records (updated with timezone-agnostic timestamps)
CREATE TABLE scp_spiritual_treatment_record (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE CASCADE UNIQUE,
    main_complaint TEXT,
    treatment_status VARCHAR(1) CHECK (treatment_status IS NULL OR treatment_status IN ('N', 'T', 'A', 'F')),
    food TEXT,
    water TEXT,
    ointments TEXT,
    light_bath BOOLEAN DEFAULT false,
    light_bath_color VARCHAR(20),
    rod BOOLEAN DEFAULT false,
    spiritual_treatment BOOLEAN DEFAULT false,
    return_in_weeks INTEGER CHECK (return_in_weeks > 0 AND return_in_weeks <= 52),
    notes TEXT,

-- Parent/child relationship for treatment episodes
parent_treatment_id INTEGER REFERENCES scp_spiritual_treatment_record (id) ON DELETE SET NULL,

-- Treatment session times converted to separate date/time fields
start_time TIME, end_time TIME,

-- Timezone-agnostic audit fields
created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME
);

-- Treatment sessions table (updated with timezone-agnostic timestamps)


CREATE TABLE scp_treatment_sessions (
    id SERIAL PRIMARY KEY,
    treatment_record_id INTEGER NOT NULL REFERENCES scp_spiritual_treatment_record (id) ON DELETE CASCADE,
    attendance_id INTEGER NOT NULL REFERENCES scp_attendance (id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES scp_patient (id) ON DELETE CASCADE,
    
    treatment_type TREATMENT_SESSION_TYPE NOT NULL,
    body_locations TEXT,
    custom_location TEXT,
    start_date DATE NOT NULL,
    planned_sessions INTEGER NOT NULL CHECK (planned_sessions > 0 AND planned_sessions <= 50),
    completed_sessions INTEGER DEFAULT 0 CHECK (completed_sessions >= 0),
    end_date DATE,
    status TREATMENT_SESSION_STATUS DEFAULT 'scheduled',

-- Light bath specific fields
duration_minutes INTEGER CHECK (
    duration_minutes IS NULL
    OR (
        duration_minutes > 0
        AND duration_minutes <= 70
    )
),
color VARCHAR(20),
notes TEXT,

-- Timezone-agnostic audit fields
created_date DATE DEFAULT CURRENT_DATE,
created_time TIME DEFAULT CURRENT_TIME,
updated_date DATE DEFAULT CURRENT_DATE,
updated_time TIME DEFAULT CURRENT_TIME,

-- Light bath constraints
CONSTRAINT check_light_bath_requirements CHECK (
        (treatment_type = 'light_bath' AND duration_minutes IS NOT NULL AND color IS NOT NULL) OR
        (treatment_type = 'rod' AND duration_minutes IS NULL AND color IS NULL)
    )
);

-- Treatment session records table (updated with timezone-agnostic timestamps)


CREATE TABLE scp_treatment_session_records (
    id SERIAL PRIMARY KEY,
    treatment_session_id INTEGER NOT NULL REFERENCES scp_treatment_sessions (id) ON DELETE CASCADE,
    attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE SET NULL,
    
    session_number INTEGER NOT NULL CHECK (session_number > 0),
    scheduled_date DATE NOT NULL,

-- Session timing converted to separate date/time fields
start_time TIME,
end_time TIME,
status SESSION_RECORD_STATUS DEFAULT 'scheduled',
notes TEXT,
missed_reason TEXT,
performed_by VARCHAR(100),

-- Timezone-agnostic audit fields


created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    
    UNIQUE(treatment_session_id, session_number)
);

-- Schedule settings table (updated with timezone-agnostic timestamps)
CREATE TABLE scp_schedule_setting (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_concurrent_spiritual INTEGER DEFAULT 1,
    max_concurrent_lightbath_rod INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,

-- Timezone-agnostic audit fields


created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    
    UNIQUE (day_of_week)
);

-- Function to update date/time fields for audit
CREATE OR REPLACE FUNCTION update_updated_date_time_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_DATE;
    NEW.updated_time = CURRENT_TIME;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating audit timestamps
CREATE TRIGGER update_patients_modtime
    BEFORE UPDATE ON scp_patient
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_attendances_modtime
    BEFORE UPDATE ON scp_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_spiritual_treatment_records_modtime
    BEFORE UPDATE ON scp_spiritual_treatment_record
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_scheduling_settings_modtime
    BEFORE UPDATE ON scp_schedule_setting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_treatment_sessions_modtime
    BEFORE UPDATE ON scp_treatment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_treatment_session_records_modtime
    BEFORE UPDATE ON scp_treatment_session_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

CREATE TRIGGER update_patient_notes_modtime
    BEFORE UPDATE ON scp_patient_note
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_time_column();

-- Enhanced function for treatment record validation
CREATE OR REPLACE FUNCTION check_one_treatment_record_per_attendance()
RETURNS TRIGGER AS $$
DECLARE
    attendance_exists BOOLEAN;
    attendance_status scp_attendance.status%TYPE;
    existing_record RECORD;
BEGIN
    -- Check if attendance exists
    SELECT EXISTS(
        SELECT 1 FROM scp_attendance WHERE id = NEW.attendance_id
    ) INTO attendance_exists;

    IF NOT attendance_exists THEN
        RAISE EXCEPTION 'Cannot create treatment record: Attendance with ID % does not exist', NEW.attendance_id;
    END IF;

    -- Check attendance status
    SELECT status INTO attendance_status
    FROM scp_attendance
    WHERE id = NEW.attendance_id;

    IF attendance_status = 'cancelled' THEN
        RAISE EXCEPTION 'Cannot create treatment record: Attendance (ID: %) is cancelled', NEW.attendance_id;
    END IF;

    -- Check for existing treatment record
    SELECT * INTO existing_record
    FROM scp_spiritual_treatment_record
    WHERE attendance_id = NEW.attendance_id;

    IF FOUND THEN
        RAISE EXCEPTION 'Cannot create treatment record: Attendance (ID: %) already has a treatment record (ID: %)',
            NEW.attendance_id, existing_record.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce one spiritual treatment record per attendance
CREATE TRIGGER ensure_one_treatment_record_per_attendance
    BEFORE INSERT ON scp_spiritual_treatment_record
    FOR EACH ROW
    EXECUTE FUNCTION check_one_treatment_record_per_attendance();

-- Performance indexes
CREATE INDEX idx_attendance_scheduled_date ON scp_attendance (scheduled_date);

CREATE INDEX idx_attendance_patient_id ON scp_attendance (patient_id);

CREATE INDEX idx_attendance_status ON scp_attendance (status);

CREATE INDEX idx_scp_patient_timezone ON scp_patient (timezone);

CREATE INDEX idx_treatment_sessions_treatment_record ON scp_treatment_sessions (treatment_record_id);

CREATE INDEX idx_treatment_sessions_patient ON scp_treatment_sessions (patient_id);

CREATE INDEX idx_treatment_session_records_session ON scp_treatment_session_records (treatment_session_id);

CREATE INDEX idx_scp_patient_note_patient_id ON scp_patient_note (patient_id);

CREATE INDEX idx_scp_patient_note_category ON scp_patient_note (category);

CREATE INDEX idx_scp_patient_note_created_date ON scp_patient_note (created_date);

CREATE INDEX idx_spiritual_treatment_parent ON scp_spiritual_treatment_record (parent_treatment_id);

CREATE INDEX idx_spiritual_treatment_status ON scp_spiritual_treatment_record (treatment_status);

-- Column comments for timezone support
COMMENT ON COLUMN scp_patient.timezone IS 'Patient timezone for scheduling and display purposes (IANA timezone format)';

COMMENT ON COLUMN scp_attendance.timezone_override IS 'Optional timezone override for specific attendances (IANA timezone format)';

-- Patient notes table comments
COMMENT ON TABLE scp_patient_note IS 'Stores patient notes and observations for healthcare providers';

COMMENT ON COLUMN scp_patient_note.patient_id IS 'Reference to the patient this note belongs to';

COMMENT ON COLUMN scp_patient_note.note_content IS 'The actual note content';

COMMENT ON COLUMN scp_patient_note.category IS 'Note category (general, treatment, observation, etc.)';

COMMENT ON COLUMN scp_patient_note.created_date IS 'Date when the note was created (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.created_time IS 'Time when the note was created (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.updated_date IS 'Date when the note was last updated (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.updated_time IS 'Time when the note was last updated (timezone-agnostic)';

-- Treatment timing and hierarchy comments
COMMENT ON COLUMN scp_attendance.checked_in_time IS 'Check-in time (date derived from attendance context)';

COMMENT ON COLUMN scp_attendance.started_time IS 'Treatment start time (date derived from attendance context)';

COMMENT ON COLUMN scp_attendance.completed_time IS 'Treatment completion time (date derived from attendance context)';

COMMENT ON COLUMN scp_spiritual_treatment_record.main_complaint IS 'Main complaint from the patient during this specific consultation session';

COMMENT ON COLUMN scp_spiritual_treatment_record.treatment_status IS 'Patient treatment status at time of consultation: N=New, T=Treatment, A=Discharged, F=Missed';

COMMENT ON COLUMN scp_spiritual_treatment_record.parent_treatment_id IS 'Links follow-up consultations to original treatment episode. NULL = main/first treatment';

COMMENT ON COLUMN scp_spiritual_treatment_record.start_time IS 'Treatment start time (date derived from attendance_date context)';

COMMENT ON COLUMN scp_spiritual_treatment_record.end_time IS 'Treatment end time (date derived from attendance_date context)';

COMMENT ON COLUMN scp_treatment_sessions.custom_location IS 'Custom body location when standard locations are not sufficient';

COMMENT ON COLUMN scp_treatment_sessions.body_locations IS 'Standard body locations for this treatment session';

COMMENT ON COLUMN scp_treatment_sessions.planned_sessions IS 'Number of sessions planned for this treatment (quantity)';

COMMENT ON COLUMN scp_treatment_session_records.start_time IS 'Session start time (date derived from scheduled_date context)';

COMMENT ON COLUMN scp_treatment_session_records.end_time IS 'Session end time (date derived from scheduled_date context)';

-- Helper function to find root treatment from migration 009
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

-- Treatment episodes view from migration 009
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

-- Default schedule settings for all days of the week
INSERT INTO
    scp_schedule_setting (
        day_of_week,
        start_time,
        end_time,
        max_concurrent_spiritual,
        max_concurrent_lightbath_rod,
        is_active
    )
VALUES (
        0,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Sunday: 6 AM to 11 PM
    (
        1,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Monday: 6 AM to 11 PM
    (
        2,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Tuesday: 6 AM to 11 PM
    (
        3,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Wednesday: 6 AM to 11 PM
    (
        4,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Thursday: 6 AM to 11 PM
    (
        5,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    ), -- Friday: 6 AM to 11 PM
    (
        6,
        '06:00:00',
        '23:00:00',
        10,
        10,
        true
    );
-- Saturday: 6 AM to 11 PM