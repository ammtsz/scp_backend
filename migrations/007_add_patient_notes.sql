-- Migration 007: Add Patient Notes System
-- This migration creates a comprehensive patient notes system to store
-- detailed observations, treatment notes, and important patient information

-- Create patient notes table
CREATE TABLE IF NOT EXISTS scp_patient_note (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    note_content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',

-- Timezone-agnostic audit fields following existing pattern
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

-- Create indexes for performance
CREATE INDEX idx_scp_patient_note_patient_id ON scp_patient_note (patient_id);

CREATE INDEX idx_scp_patient_note_category ON scp_patient_note (category);

CREATE INDEX idx_scp_patient_note_created_date ON scp_patient_note (created_date);

-- Add comments for documentation
COMMENT ON TABLE scp_patient_note IS 'Stores patient notes and observations for healthcare providers';

COMMENT ON COLUMN scp_patient_note.patient_id IS 'Reference to the patient this note belongs to';

COMMENT ON COLUMN scp_patient_note.note_content IS 'The actual note content';

COMMENT ON COLUMN scp_patient_note.category IS 'Note category (general, treatment, observation, etc.)';

COMMENT ON COLUMN scp_patient_note.created_date IS 'Date when the note was created (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.created_time IS 'Time when the note was created (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.updated_date IS 'Date when the note was last updated (timezone-agnostic)';

COMMENT ON COLUMN scp_patient_note.updated_time IS 'Time when the note was last updated (timezone-agnostic)';

-- Create a trigger to automatically update the updated_date and updated_time
CREATE OR REPLACE FUNCTION update_patient_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_DATE;
    NEW.updated_time = CURRENT_TIME;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_note_timestamp
    BEFORE UPDATE ON scp_patient_note
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_note_timestamp();