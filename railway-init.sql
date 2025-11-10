-- Essential Railway Database Initialization
-- Core schema for MVP Center project
-- Run this in Railway PostgreSQL console

-- Domain Types
CREATE TYPE PATIENT_PRIORITY AS ENUM ('1', '2', '3');

CREATE TYPE TREATMENT_STATUS AS ENUM ('N', 'T', 'A', 'F');

CREATE TYPE ATTENDANCE_TYPE AS ENUM ('spiritual', 'light_bath', 'rod');

CREATE TYPE ATTENDANCE_STATUS AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'missed');

CREATE TYPE TREATMENT_SESSION_TYPE AS ENUM ('light_bath', 'rod');

CREATE TYPE TREATMENT_SESSION_STATUS AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

CREATE TYPE SESSION_RECORD_STATUS AS ENUM ('scheduled', 'completed', 'missed', 'cancelled');

-- Core Tables
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
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    CONSTRAINT valid_phone CHECK (
        phone ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$'
    ),
    CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE)
);

CREATE TABLE scp_attendance (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    attendance_type ATTENDANCE_TYPE NOT NULL,
    status ATTENDANCE_STATUS DEFAULT 'scheduled',
    priority PATIENT_PRIORITY DEFAULT '3',
    scheduled_date DATE,
    scheduled_time TIME,
    checkin_date DATE,
    checkin_time TIME,
    completion_date DATE,
    completion_time TIME,
    main_complaint TEXT,
    absence_notes TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    CONSTRAINT fk_attendance_patient FOREIGN KEY (patient_id) REFERENCES scp_patient (id) ON DELETE CASCADE
);

CREATE TABLE scp_treatment_record (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    attendance_id INTEGER,
    treatment_type VARCHAR(50) NOT NULL,
    body_location VARCHAR(100),
    start_date DATE,
    start_time TIME,
    color VARCHAR(20),
    duration_minutes INTEGER,
    quantity INTEGER DEFAULT 1,
    main_complaint TEXT,
    general_recommendations TEXT,
    treatment_recommendations TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    CONSTRAINT fk_treatment_patient FOREIGN KEY (patient_id) REFERENCES scp_patient (id) ON DELETE CASCADE,
    CONSTRAINT fk_treatment_attendance FOREIGN KEY (attendance_id) REFERENCES scp_attendance (id) ON DELETE SET NULL
);

CREATE TABLE scp_schedule_setting (
    id SERIAL PRIMARY KEY,
    schedule_name VARCHAR(100) NOT NULL UNIQUE,
    max_concurrent_light_bath INTEGER DEFAULT 12,
    max_concurrent_spiritual INTEGER DEFAULT 3,
    max_concurrent_rod INTEGER DEFAULT 6,
    is_active BOOLEAN DEFAULT true,
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME
);

-- Missing tables from application logs
CREATE TABLE scp_spiritual_treatment_record (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE CASCADE UNIQUE,
    main_complaint TEXT,
    food TEXT,
    water TEXT,
    ointments TEXT,
    light_bath BOOLEAN DEFAULT false,
    light_bath_color VARCHAR(20),
    rod BOOLEAN DEFAULT false,
    spiritual_treatment BOOLEAN DEFAULT false,
    return_in_weeks INTEGER CHECK (
        return_in_weeks > 0
        AND return_in_weeks <= 52
    ),
    notes TEXT,
    parent_treatment_id INTEGER REFERENCES scp_spiritual_treatment_record (id) ON DELETE SET NULL,
    start_time TIME,
    end_time TIME,
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME
);

CREATE TABLE scp_treatment_sessions (
    id SERIAL PRIMARY KEY,
    treatment_record_id INTEGER NOT NULL REFERENCES scp_spiritual_treatment_record (id) ON DELETE CASCADE,
    attendance_id INTEGER NOT NULL REFERENCES scp_attendance (id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES scp_patient (id) ON DELETE CASCADE,
    treatment_type TREATMENT_SESSION_TYPE NOT NULL,
    body_locations TEXT,
    custom_location TEXT,
    start_date DATE NOT NULL,
    planned_sessions INTEGER NOT NULL CHECK (
        planned_sessions > 0
        AND planned_sessions <= 50
    ),
    completed_sessions INTEGER DEFAULT 0 CHECK (completed_sessions >= 0),
    end_date DATE,
    status TREATMENT_SESSION_STATUS DEFAULT 'scheduled',
    duration_minutes INTEGER CHECK (
        duration_minutes IS NULL
        OR (
            duration_minutes > 0
            AND duration_minutes <= 70
        )
    ),
    color VARCHAR(20),
    notes TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    CONSTRAINT check_light_bath_requirements CHECK (
        (
            treatment_type = 'light_bath'
            AND duration_minutes IS NOT NULL
            AND color IS NOT NULL
        )
        OR (
            treatment_type = 'rod'
            AND duration_minutes IS NULL
            AND color IS NULL
        )
    )
);

CREATE TABLE scp_treatment_session_records (
    id SERIAL PRIMARY KEY,
    treatment_session_id INTEGER NOT NULL REFERENCES scp_treatment_sessions (id) ON DELETE CASCADE,
    attendance_id INTEGER REFERENCES scp_attendance (id) ON DELETE SET NULL,
    session_number INTEGER NOT NULL CHECK (session_number > 0),
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status SESSION_RECORD_STATUS DEFAULT 'scheduled',
    notes TEXT,
    missed_reason TEXT,
    performed_by VARCHAR(100),
    created_date DATE DEFAULT CURRENT_DATE,
    created_time TIME DEFAULT CURRENT_TIME,
    updated_date DATE DEFAULT CURRENT_DATE,
    updated_time TIME DEFAULT CURRENT_TIME,
    UNIQUE (
        treatment_session_id,
        session_number
    )
);

-- Insert default schedule setting
INSERT INTO
    scp_schedule_setting (
        schedule_name,
        max_concurrent_light_bath,
        max_concurrent_spiritual,
        max_concurrent_rod
    )
VALUES ('Default Schedule', 12, 3, 6);

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;