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

-- Medical attendance records (updated with timezone-agnostic timestamps)
CREATE TABLE scp_attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES scp_patient (id) ON DELETE CASCADE,
    type ATTENDANCE_TYPE NOT NULL,
    status ATTENDANCE_STATUS DEFAULT 'scheduled',

-- Scheduled date/time (already timezone-agnostic)
scheduled_date DATE NOT NULL, scheduled_time TIME NOT NULL,

-- Event timestamps converted to separate date/time fields
checked_in_date DATE,
checked_in_time TIME,
started_date DATE,
started_time TIME,
completed_date DATE,
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
    food TEXT,
    water TEXT,
    ointments TEXT,
    light_bath BOOLEAN DEFAULT false,
    light_bath_color VARCHAR(20),
    rod BOOLEAN DEFAULT false,
    spiritual_treatment BOOLEAN DEFAULT false,
    return_in_weeks INTEGER CHECK (return_in_weeks > 0 AND return_in_weeks <= 52),
    notes TEXT,

-- Location and quantity fields
location TEXT [] DEFAULT '{}',
custom_location TEXT,
quantity INTEGER DEFAULT 1,

-- Treatment session times converted to separate date/time fields
treatment_start_date DATE,
treatment_start_time TIME,
treatment_end_date DATE,
treatment_end_time TIME,

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
start_date DATE,
start_time TIME,
end_date DATE,
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

-- Column comments for timezone support
COMMENT ON COLUMN scp_patient.timezone IS 'Patient timezone for scheduling and display purposes (IANA timezone format)';

COMMENT ON COLUMN scp_attendance.timezone_override IS 'Optional timezone override for specific attendances (IANA timezone format)';

-- Default schedule settings for Tuesday operations
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
        2,
        '19:00:00',
        '21:30:00',
        4,
        2,
        true
    );
-- Tuesday: 7 PM to 9:30 PM