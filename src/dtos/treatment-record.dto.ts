import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreatmentRecordDto {
  @ApiProperty({
    description: 'ID of the related attendance',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  attendance_id: number;

  @ApiPropertyOptional({
    description: 'Main complaint from the patient',
    example: 'Pain in lower back',
  })
  @IsString()
  @IsOptional()
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Treatment status for patient update (not stored in treatment record)',
    example: 'T',
    enum: ['N', 'T', 'A', 'F'],
  })
  @IsString()
  @IsOptional()
  treatment_status?: string;

  @ApiPropertyOptional({
    description: 'Food recommendations',
    example: 'Avoid dairy products',
  })
  @IsString()
  @IsOptional()
  food?: string;

  @ApiPropertyOptional({
    description: 'Water recommendations',
    example: 'Drink 2L of fluidized water daily',
  })
  @IsString()
  @IsOptional()
  water?: string;

  @ApiPropertyOptional({
    description: 'Ointment recommendations',
    example: 'Apply chamomile ointment before bed',
  })
  @IsString()
  @IsOptional()
  ointments?: string;

  @ApiPropertyOptional({
    description: 'Whether light bath treatment was given',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  light_bath?: boolean;

  @ApiPropertyOptional({
    description: 'Color for light bath treatment',
    example: 'azul',
    enum: ['azul', 'verde', 'amarelo', 'vermelho', 'violeta', 'branco', 'laranja'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['azul', 'verde', 'amarelo', 'vermelho', 'violeta', 'branco', 'laranja'])
  light_bath_color?: string;

  @ApiPropertyOptional({
    description: 'Whether rod treatment was given',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  rod?: boolean;

  @ApiPropertyOptional({
    description: 'Whether spiritual treatment was given',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  spiritual_treatment?: boolean;

  @ApiPropertyOptional({
    description: 'Number of weeks until next appointment',
    minimum: 1,
    maximum: 52,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(52)
  return_in_weeks?: number;

  @ApiPropertyOptional({
    description: 'Additional treatment notes',
    example: 'Patient showed improvement in energy levels',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Parent treatment ID for linking follow-up consultations to original treatment episode',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  parent_treatment_id?: number;
}

export class UpdateTreatmentRecordDto {
  @ApiPropertyOptional({
    description: 'ID of the related attendance',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  attendance_id?: number;

  @ApiPropertyOptional({
    description: 'Main complaint from the patient',
    example: 'Pain in lower back',
  })
  @IsString()
  @IsOptional()
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Treatment status for patient update (not stored in treatment record)',
    example: 'T',
    enum: ['N', 'T', 'A', 'F'],
  })
  @IsString()
  @IsOptional()
  treatment_status?: string;

  @ApiPropertyOptional({
    description: 'Food recommendations',
    example: 'Avoid dairy products',
  })
  @IsString()
  @IsOptional()
  food?: string;

  @ApiPropertyOptional({
    description: 'Water recommendations',
    example: 'Drink 2L of fluidized water daily',
  })
  @IsString()
  @IsOptional()
  water?: string;

  @ApiPropertyOptional({
    description: 'Ointment recommendations',
    example: 'Apply chamomile ointment before bed',
  })
  @IsString()
  @IsOptional()
  ointments?: string;

  @ApiPropertyOptional({
    description: 'Whether light bath treatment was given',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  light_bath?: boolean;

  @ApiPropertyOptional({
    description: 'Color for light bath treatment',
    example: 'azul',
    enum: ['azul', 'verde', 'amarelo', 'vermelho', 'violeta', 'branco', 'laranja'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['azul', 'verde', 'amarelo', 'vermelho', 'violeta', 'branco', 'laranja'])
  light_bath_color?: string;

  @ApiPropertyOptional({
    description: 'Whether rod treatment was given',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  rod?: boolean;

  @ApiPropertyOptional({
    description: 'Whether spiritual treatment was given',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  spiritual_treatment?: boolean;

  @ApiPropertyOptional({
    description: 'Number of weeks until next appointment',
    minimum: 1,
    maximum: 52,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(52)
  return_in_weeks?: number;

  @ApiPropertyOptional({
    description: 'Additional treatment notes',
    example: 'Patient showed improvement in energy levels',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Parent treatment ID for linking follow-up consultations to original treatment episode',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  parent_treatment_id?: number;
}

export class TreatmentRecordResponseDto {
  @ApiProperty({
    description: 'Treatment record ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the related attendance',
    example: 1,
  })
  attendance_id: number;

  @ApiPropertyOptional({
    description: 'Main complaint from the patient',
    example: 'Pain in lower back',
  })
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Food recommendations',
    example: 'Avoid dairy products',
  })
  food?: string;

  @ApiPropertyOptional({
    description: 'Water recommendations',
    example: 'Drink 2L of fluidized water daily',
  })
  water?: string;

  @ApiPropertyOptional({
    description: 'Ointment recommendations',
    example: 'Apply chamomile ointment before bed',
  })
  ointments?: string;

  @ApiPropertyOptional({
    description: 'Whether light bath treatment was given',
    example: true,
  })
  light_bath?: boolean;

  @ApiPropertyOptional({
    description: 'Color for light bath treatment',
    example: 'azul',
    enum: ['azul', 'verde', 'amarelo', 'vermelho', 'violeta', 'branco', 'laranja'],
  })
  light_bath_color?: string;

  @ApiPropertyOptional({
    description: 'Whether rod treatment was given',
    example: false,
  })
  rod?: boolean;

  @ApiPropertyOptional({
    description: 'Whether spiritual treatment was given',
    example: true,
  })
  spiritual_treatment?: boolean;

  @ApiPropertyOptional({
    description: 'Number of weeks until next appointment',
    example: 2,
  })
  return_in_weeks?: number;

  @ApiPropertyOptional({
    description: 'Additional treatment notes',
    example: 'Patient showed improvement in energy levels',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Parent treatment ID for linking follow-up consultations to original treatment episode',
    example: 1,
  })
  parent_treatment_id?: number;

  @ApiProperty({
    description: 'Record creation date',
    example: '2025-07-22',
  })
  created_date: string;

  @ApiProperty({
    description: 'Record creation time',
    example: '10:00:00',
  })
  created_time: string;

  @ApiProperty({
    description: 'Record last update date',
    example: '2025-07-22',
  })
  updated_date: string;

  @ApiProperty({
    description: 'Record last update time',
    example: '10:00:00',
  })
  updated_time: string;
}

export class TreatmentSessionResult {
  @ApiProperty({
    description: 'Whether the treatment session was created successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'List of errors encountered during session creation',
    example: ['Failed to create attendance: Patient already has appointment at this time'],
    type: [String],
  })
  errors: string[];
}

export class TreatmentSessionsResult {
  @ApiPropertyOptional({
    description: 'Result of light bath session creation',
    type: TreatmentSessionResult,
  })
  lightBathResult?: TreatmentSessionResult;

  @ApiPropertyOptional({
    description: 'Result of rod session creation',
    type: TreatmentSessionResult,
  })
  rodResult?: TreatmentSessionResult;
}

export class UpdateTreatmentRecordResponseDto {
  @ApiProperty({
    description: 'The updated treatment record',
    type: TreatmentRecordResponseDto,
  })
  record: TreatmentRecordResponseDto;

  @ApiPropertyOptional({
    description: 'Results of any treatment sessions created during the update',
    type: TreatmentSessionsResult,
  })
  treatmentSessions?: TreatmentSessionsResult;
}
