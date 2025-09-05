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
    description: 'Updated check-in timestamp',
    example: '2025-08-06T19:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  checked_in_at?: Date;

  @ApiPropertyOptional({
    description: 'Updated start timestamp',
    example: '2025-08-06T19:35:00Z',
  })
  @IsDateString()
  @IsOptional()
  started_at?: Date;

  @ApiPropertyOptional({
    description: 'Updated completion timestamp',
    example: '2025-08-06T20:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  completed_at?: Date;

  @ApiPropertyOptional({
    description: 'Updated cancellation timestamp',
    example: null,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  cancelled_at?: Date;

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
    description: 'Check-in timestamp',
    example: '2025-08-06T19:30:00Z',
  })
  checked_in_at?: Date;

  @ApiPropertyOptional({
    description: 'Start timestamp',
    example: '2025-08-06T19:35:00Z',
  })
  started_at?: Date;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
    example: '2025-08-06T20:00:00Z',
  })
  completed_at?: Date;

  @ApiPropertyOptional({
    description: 'Cancellation timestamp',
    example: null,
    nullable: true,
  })
  cancelled_at?: Date;

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
    example: '2025-08-06T19:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-08-06T19:30:00Z',
  })
  updated_at: Date;

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
