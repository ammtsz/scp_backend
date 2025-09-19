import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientPriority, TreatmentStatus } from '../common/enums';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '(11) 99999-9999',
    pattern: '(XX) XXXXX-XXXX or (XX) XXXX-XXXX',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Phone must be in format (XX) XXXXX-XXXX or (XX) XXXX-XXXX',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Patient priority level',
    enum: PatientPriority,
    default: PatientPriority.NORMAL,
    example: PatientPriority.NORMAL,
  })
  @IsEnum(PatientPriority)
  @IsOptional()
  priority?: PatientPriority = PatientPriority.NORMAL;

  @ApiPropertyOptional({
    description: 'Patient treatment status',
    enum: TreatmentStatus,
    default: TreatmentStatus.NEW_PATIENT,
    example: TreatmentStatus.NEW_PATIENT,
  })
  @IsEnum(TreatmentStatus)
  @IsOptional()
  treatment_status?: TreatmentStatus = TreatmentStatus.NEW_PATIENT;

  @ApiPropertyOptional({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({
    description: 'Main health complaint',
    example: 'Frequent headaches',
  })
  @IsString()
  @IsOptional()
  main_complaint?: string;
}

export class UpdatePatientDto {
  @ApiPropertyOptional({
    description: 'Patient full name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '(11) 99999-9999',
    pattern: '(XX) XXXXX-XXXX or (XX) XXXX-XXXX',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Phone must be in format (XX) XXXXX-XXXX or (XX) XXXX-XXXX',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Patient priority level',
    enum: PatientPriority,
    example: PatientPriority.NORMAL,
  })
  @IsEnum(PatientPriority)
  @IsOptional()
  priority?: PatientPriority;

  @ApiPropertyOptional({
    description: 'Patient treatment status',
    enum: TreatmentStatus,
    example: TreatmentStatus.IN_TREATMENT,
  })
  @IsEnum(TreatmentStatus)
  @IsOptional()
  treatment_status?: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({
    description: 'Main health complaint',
    example: 'Frequent headaches',
  })
  @IsString()
  @IsOptional()
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Patient discharge date',
    example: '2025-12-31',
  })
  @IsDateString()
  @IsOptional()
  discharge_date?: string;
}

export class PatientResponseDto {
  @ApiProperty({
    description: 'Patient unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Patient full name',
    example: 'John Doe',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '(11) 99999-9999',
  })
  phone?: string;

  @ApiProperty({
    description: 'Patient priority level',
    enum: PatientPriority,
    example: PatientPriority.NORMAL,
  })
  priority: PatientPriority;

  @ApiProperty({
    description: 'Patient treatment status',
    enum: TreatmentStatus,
    example: TreatmentStatus.IN_TREATMENT,
  })
  treatment_status: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  birth_date?: string;

  @ApiPropertyOptional({
    description: 'Main health complaint',
    example: 'Frequent headaches',
  })
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Patient discharge date',
    example: '2025-12-31',
  })
  discharge_date?: string;

  @ApiProperty({
    description: 'Treatment start date',
    example: '2025-07-22',
  })
  start_date: string;

  @ApiProperty({
    description: 'Number of consecutive missing appointments',
    example: 0,
  })
  missing_appointments_streak: number;

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
