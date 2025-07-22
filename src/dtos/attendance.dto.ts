import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType, AttendanceStatus } from '../common/enums';

export class CreateAttendanceDto {
    @ApiProperty({ description: 'Patient ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    patient_id: number;

    @ApiProperty({
        description: 'Type of attendance',
        enum: AttendanceType,
        example: 'FIRST_TIME'
    })
    @IsEnum(AttendanceType)
    @IsNotEmpty()
    type: AttendanceType;

    @ApiProperty({ 
        description: 'Date of attendance',
        example: '2025-07-22',
        format: 'YYYY-MM-DD'
    })
    @IsDateString()
    @IsNotEmpty()
    scheduled_date: string;

    @ApiProperty({ 
        description: 'Time of attendance',
        example: '14:30',
        pattern: 'HH:mm'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in format HH:mm'
    })
    scheduled_time: string;

    @ApiPropertyOptional({ 
        description: 'Additional notes',
        example: 'First consultation notes'
    })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateAttendanceDto {
    @ApiPropertyOptional({
        description: 'Status of attendance',
        enum: AttendanceStatus,
        example: 'IN_PROGRESS'
    })
    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;

    @ApiPropertyOptional({ 
        description: 'Updated notes',
        example: 'Patient reported improvement'
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
        example: 'FIRST_TIME'
    })
    type: AttendanceType;

    @ApiProperty({
        description: 'Status of attendance',
        enum: AttendanceStatus,
        example: 'SCHEDULED'
    })
    status: AttendanceStatus;

    @ApiProperty({ 
        description: 'Date of attendance',
        example: '2025-07-22'
    })
    scheduled_date: string;

    @ApiProperty({ 
        description: 'Time of attendance',
        example: '14:30'
    })
    scheduled_time: string;

    @ApiPropertyOptional({ 
        description: 'Check-in timestamp',
        example: '2025-07-22T14:30:00Z'
    })
    checked_in_at?: Date;

    @ApiPropertyOptional({ 
        description: 'Start timestamp',
        example: '2025-07-22T14:35:00Z'
    })
    started_at?: Date;

    @ApiPropertyOptional({ 
        description: 'Completion timestamp',
        example: '2025-07-22T15:00:00Z'
    })
    completed_at?: Date;

    @ApiPropertyOptional({ 
        description: 'Cancellation timestamp',
        example: null
    })
    cancelled_at?: Date;

    @ApiPropertyOptional({ description: 'Additional notes' })
    notes?: string;

    @ApiProperty({ 
        description: 'Creation timestamp',
        example: '2025-07-22T14:30:00Z'
    })
    created_at: Date;

    @ApiProperty({ 
        description: 'Last update timestamp',
        example: '2025-07-22T14:30:00Z'
    })
    updated_at: Date;
}
