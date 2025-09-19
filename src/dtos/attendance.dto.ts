import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { PatientResponseDto } from './patient.dto';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Patient ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  patient_id: number;

  @ApiProperty({
    description: 'Type of attendance',
    enum: AttendanceType,
    example: AttendanceType.SPIRITUAL,
  })
  @IsEnum(AttendanceType)
  @IsNotEmpty()
  type: AttendanceType;

  @ApiProperty({
    description: 'Date of attendance',
    example: '2025-07-22',
    format: 'YYYY-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduled_date: string;

  @ApiProperty({
    description: 'Time of attendance',
    example: '19:30',
    pattern: 'HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  scheduled_time: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'First consultation notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    description: 'Updated type of attendance',
    enum: AttendanceType,
    example: AttendanceType.SPIRITUAL,
  })
  @IsEnum(AttendanceType)
  @IsOptional()
  type?: AttendanceType;

  @ApiPropertyOptional({
    description: 'Status of attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.IN_PROGRESS,
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Updated scheduled date',
    example: '2025-08-06',
    format: 'YYYY-MM-DD',
  })
  @IsDateString()
  @IsOptional()
  scheduled_date?: string;

  @ApiPropertyOptional({
    description: 'Updated scheduled time',
    example: '19:30',
    pattern: 'HH:mm',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  scheduled_time?: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '19:30:00',
    pattern: 'HH:mm:ss',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  checked_in_time?: string;

  @ApiPropertyOptional({
    description: 'Start time',
    example: '19:35:00',
    pattern: 'HH:mm:ss',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  started_time?: string;

  @ApiPropertyOptional({
    description: 'Completion time',
    example: '20:00:00',
    pattern: 'HH:mm:ss',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  completed_time?: string;

  @ApiPropertyOptional({
    description: 'Cancellation date',
    example: '2025-08-06',
    format: 'YYYY-MM-DD',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  cancelled_date?: string;

  @ApiPropertyOptional({
    description: 'Whether the absence is justified',
    example: null,
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  absence_justified?: boolean;

  @ApiPropertyOptional({
    description: 'Notes explaining the reason for absence',
    example: 'Patient had a medical emergency',
  })
  @IsString()
  @IsOptional()
  absence_notes?: string;

  @ApiPropertyOptional({
    description: 'Updated notes',
    example: 'Patient reported improvement',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AttendanceResponseDto {
  @ApiProperty({ description: 'Attendance ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Patient ID', example: 1 })
  patient_id: number;

  @ApiProperty({
    description: 'Type of attendance',
    enum: AttendanceType,
    example: AttendanceType.SPIRITUAL,
  })
  type: AttendanceType;

  @ApiProperty({
    description: 'Status of attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.SCHEDULED,
  })
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Date of attendance',
    example: '2025-08-06',
    format: 'YYYY-MM-DD',
  })
  scheduled_date: string;

  @ApiProperty({
    description: 'Time of attendance',
    example: '19:30',
    pattern: 'HH:mm',
  })
  scheduled_time: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '19:30:00',
    pattern: 'HH:mm:ss',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  checked_in_time?: string;

  @ApiPropertyOptional({
    description: 'Start time',
    example: '19:35:00',
    pattern: 'HH:mm:ss',
  })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  started_time?: string;

  @ApiPropertyOptional({
    description: 'Completion time',
    example: '20:00:00',
    pattern: 'HH:mm:ss',
  })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm:ss',
  })
  completed_time?: string;

  @ApiPropertyOptional({
    description: 'Cancellation date',
    example: '2025-08-06',
    nullable: true,
    type: 'string',
  })
  cancelled_date?: string;

  @ApiPropertyOptional({
    description: 'Whether the absence is justified',
    example: null,
    nullable: true,
  })
  absence_justified?: boolean;

  @ApiPropertyOptional({
    description: 'Notes explaining the reason for absence',
    example: 'Patient had a medical emergency',
  })
  absence_notes?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-08-06T19:30:00',
    type: 'string',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-08-06T19:30:00',
    type: 'string',
  })
  updated_at: string;

  @ApiPropertyOptional({
    description: 'Patient information',
    type: () => PatientResponseDto,
  })
  patient?: PatientResponseDto;
}

// Simplified DTO for agenda view - contains only essential information
export class AttendanceAgendaDto {
  @ApiProperty({ description: 'Attendance ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Patient ID', example: 1 })
  patient_id: number;

  @ApiProperty({
    description: 'Type of attendance',
    enum: AttendanceType,
    example: AttendanceType.SPIRITUAL,
  })
  type: AttendanceType;

  @ApiProperty({
    description: 'Status of attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.SCHEDULED,
  })
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Date of attendance',
    example: '2025-07-29',
    format: 'YYYY-MM-DD',
  })
  scheduled_date: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  notes?: string;

  @ApiProperty({
    description: 'Patient name',
    example: 'João Silva',
  })
  patient_name: string;

  @ApiProperty({
    description: 'Patient priority',
    example: 'NORMAL',
  })
  patient_priority: string;
}

// DTO for next scheduled attendance date
export class NextAttendanceDateDto {
  @ApiProperty({
    description: 'Next scheduled attendance date',
    example: '2025-07-30',
    format: 'YYYY-MM-DD',
  })
  next_date: string;
}
