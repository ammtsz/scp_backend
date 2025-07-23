-- PostgreSQL schema for SCP (Spiritual Center Project)
-- This schema manages patient records, attendances, treatments, and scheduling
-- Version: 1.0
-- Last Updated: 2025-07-21

-- Domain Types
-- Priority levels for patient treatment
CREATE TYPE PATIENT_PRIORITY AS ENUM (
    '1', -- Emergency: Requires immediate attention
    '2', -- Intermediate: Priority but not urgent
    '3'  -- Normal: Standard priority level
);

-- Patient treatment status in the system
CREATE TYPE PATIENT_STATUS AS ENUM (
    'new',         -- Just registered
    'in_progress', -- Currently under treatment
    'active',      -- Regular attendance
    'terminated',  -- Treatment stopped
    'finished'     -- Treatment completed
);

-- Types of medical treatments available
CREATE TYPE ATTENDANCE_TYPE AS ENUM (
    'spiritual',   -- Spiritual consultation
    'light_bath',  -- Light therapy treatment
    'rod'         -- Rod therapy treatment
);

-- Status tracking for attendance flow
CREATE TYPE ATTENDANCE_STATUS AS ENUM (
    'scheduled',   -- Appointment is scheduled
    'checked_in',  -- Patient has arrived
    'in_progress', -- Treatment is ongoing
    'completed',   -- Treatment is finished
    'cancelled'    -- Appointment was cancelled
);

-- Core patient information
CREATE TABLE scp_patient (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    priority PATIENT_PRIORITY DEFAULT '3',      -- Default to normal priority
    status PATIENT_STATUS DEFAULT 'new',
    birth_date DATE,
    main_complaint TEXT,
    start_date DATE DEFAULT CURRENT_DATE,       -- Treatment start date
    discharge_date DATE,                        -- Treatment end date
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Validate phone format
CONSTRAINT valid_phone CHECK (phone ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$'),
    -- Ensure birth_date is not in the future
    CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE)
);

-- Medical attendance records
CREATE TABLE scp_attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES scp_patient (id) ON DELETE CASCADE,
    type ATTENDANCE_TYPE NOT NULL,
    status ATTENDANCE_STATUS DEFAULT 'scheduled',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    checked_in_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed treatment records and recommendations
CREATE TABLE scp_treatment_record (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE CASCADE UNIQUE,
    food TEXT,
    water TEXT,
    ointments TEXT,
    light_bath BOOLEAN DEFAULT false,
    rod BOOLEAN DEFAULT false,
    spiritual_treatment BOOLEAN DEFAULT false,
    return_in_weeks INTEGER CHECK (
        return_in_weeks > 0
        AND return_in_weeks <= 52
    ),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to ensure one treatment record per attendance
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
    FROM scp_treatment_record
    WHERE attendance_id = NEW.attendance_id;

    IF FOUND THEN
        RAISE EXCEPTION 'Cannot create treatment record: Attendance (ID: %) already has a treatment record (ID: %)',
            NEW.attendance_id, existing_record.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce one treatment record per attendance
CREATE TRIGGER ensure_one_treatment_record_per_attendance
    BEFORE INSERT ON scp_treatment_record
    FOR EACH ROW
    EXECUTE FUNCTION check_one_treatment_record_per_attendance();

-- Operational hours and capacity configuration
CREATE TABLE scp_schedule_setting (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_concurrent_spiritual INTEGER DEFAULT 1,
    max_concurrent_light_bath INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (day_of_week)
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_patients_modtime
    BEFORE UPDATE ON scp_patient
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendances_modtime
    BEFORE UPDATE ON scp_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_records_modtime
    BEFORE UPDATE ON scp_treatment_record
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_settings_modtime
    BEFORE UPDATE ON scp_schedule_setting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial scheduling settings
INSERT INTO
    scp_schedule_setting (
        day_of_week,
        start_time,
        end_time
    )
VALUES (2, '19:00', '23:00');
-- Tuesday from 19:00 to 23:00

-- Sample data
INSERT INTO
    scp_patient (
        name,
        phone,
        priority,
        status,
        birth_date,
        main_complaint
    )
VALUES (
        'Maria Silva',
        '(11) 99999-1111',
        '3',
        'active',
        '1980-05-15',
        'Dores de cabeça'
    ),
    (
        'João Santos',
        '(11) 99999-2222',
        '2',
        'new',
        '1975-03-22',
        'Insônia'
    ),
    (
        'Ana Paula',
        '(11) 99999-3333',
        '1',
        'in_progress',
        '1990-08-10',
        'Ansiedade'
    );

-- Sample attendances
INSERT INTO
    scp_attendance (
        patient_id,
        type,
        status,
        scheduled_date,
        scheduled_time,
        notes
    )
VALUES (
        1,
        'spiritual',
        'scheduled',
        '2025-07-29',
        '19:00',
        'Primeira consulta'
    ),
    (
        2,
        'light_bath',
        'scheduled',
        '2025-07-29',
        '19:00',
        'Primeira consulta'
    ),
    (
        3,
        'spiritual',
        'scheduled',
        '2025-07-29',
        '19:30',
        'Atendimento emergencial'
    );

-- Sample treatment records
INSERT INTO
    scp_treatment_record (
        attendance_id,
        food,
        water,
        ointments,
        light_bath,
        rod,
        spiritual_treatment,
        return_in_weeks,
        notes
    )
VALUES (
        1,
        'Frutas e verduras',
        '2L por dia',
        'Pomada calmante',
        true,
        false,
        true,
        2,
        'Paciente apresentou melhora. Manter repouso e fazer as orientações'
    );

-- Add performance indexes
CREATE INDEX idx_attendances_date_time ON scp_attendance (
    scheduled_date,
    scheduled_time
);

CREATE INDEX idx_attendances_patient ON scp_attendance (patient_id);

CREATE INDEX idx_attendances_type_status ON scp_attendance (type, status);

CREATE INDEX idx_attendances_timestamps ON scp_attendance (
    checked_in_at,
    started_at,
    completed_at
);

CREATE INDEX idx_treatment_records_attendance ON scp_treatment_record (attendance_id);

CREATE INDEX idx_patients_status ON scp_patient (status);

CREATE INDEX idx_patients_priority ON scp_patient (priority);

CREATE INDEX idx_patients_name ON scp_patient (name);

-- Add data integrity constraints
ALTER TABLE scp_patient
ADD CONSTRAINT check_discharge_after_start CHECK (
    discharge_date IS NULL
    OR discharge_date >= start_date
);

ALTER TABLE scp_attendance
ADD CONSTRAINT check_completion_timeline CHECK (
    (
        checked_in_at IS NULL
        OR checked_in_at >= scheduled_date
    )
    AND (
        started_at IS NULL
        OR started_at >= checked_in_at
    )
    AND (
        completed_at IS NULL
        OR completed_at >= started_at
    )
    AND (
        cancelled_at IS NULL
        OR (
            completed_at IS NULL
            AND started_at IS NULL
            AND checked_in_at IS NULL
        )
    )
);

ALTER TABLE scp_treatment_record
ADD CONSTRAINT check_return_weeks CHECK (
    return_in_weeks > 0
    AND return_in_weeks <= 52
);

-- Database Configuration Settings
ALTER DATABASE scp_database SET timezone TO 'America/Sao_Paulo';

ALTER DATABASE scp_database
SET
    default_text_search_config = 'portuguese';

-- Table documentation
COMMENT ON TABLE scp_patient IS 'Core patient information and status';

COMMENT ON TABLE scp_attendance IS 'Tracks all patient visits and their status';

COMMENT ON TABLE scp_treatment_record IS 'Detailed treatment information and recommendations';

COMMENT ON TABLE scp_schedule_setting IS 'Operational hours and treatment capacity settings';

-- For detailed query documentation and examples, see /docs/database-queries.md