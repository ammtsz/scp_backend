import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Available note categories
export const NOTE_CATEGORIES = [
  'general',
  'treatment',
  'observation',
  'behavior',
  'medication',
  'progress',
  'family',
  'emergency',
] as const;

export type NoteCategory = typeof NOTE_CATEGORIES[number];

export class CreatePatientNoteDto {
  @ApiProperty({
    description: 'The content of the patient note',
    example: 'Patient reported significant improvement in sleep quality after treatment.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, {
    message: 'Note content cannot exceed 2000 characters',
  })
  note_content: string;

  @ApiPropertyOptional({
    description: 'Category of the note',
    enum: NOTE_CATEGORIES,
    default: 'general',
    example: 'treatment',
  })
  @IsString()
  @IsOptional()
  @IsIn(NOTE_CATEGORIES, {
    message: `Category must be one of: ${NOTE_CATEGORIES.join(', ')}`,
  })
  category?: NoteCategory = 'general';
}

export class UpdatePatientNoteDto {
  @ApiPropertyOptional({
    description: 'The content of the patient note',
    example: 'Patient reported significant improvement in sleep quality after treatment.',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(2000, {
    message: 'Note content cannot exceed 2000 characters',
  })
  note_content?: string;

  @ApiPropertyOptional({
    description: 'Category of the note',
    enum: NOTE_CATEGORIES,
    example: 'treatment',
  })
  @IsString()
  @IsOptional()
  @IsIn(NOTE_CATEGORIES, {
    message: `Category must be one of: ${NOTE_CATEGORIES.join(', ')}`,
  })
  category?: NoteCategory;
}

export class PatientNoteResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the note',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the patient this note belongs to',
    example: 123,
  })
  patient_id: number;

  @ApiProperty({
    description: 'The content of the patient note',
    example: 'Patient reported significant improvement in sleep quality after treatment.',
  })
  note_content: string;

  @ApiProperty({
    description: 'Category of the note',
    enum: NOTE_CATEGORIES,
    example: 'treatment',
  })
  category: string;

  @ApiProperty({
    description: 'Date when the note was created',
    example: '2025-01-15',
  })
  created_date: string;

  @ApiProperty({
    description: 'Time when the note was created',
    example: '14:30:00',
  })
  created_time: string;

  @ApiProperty({
    description: 'Date when the note was last updated',
    example: '2025-01-15',
  })
  updated_date: string;

  @ApiProperty({
    description: 'Time when the note was last updated',
    example: '14:30:00',
  })
  updated_time: string;
}