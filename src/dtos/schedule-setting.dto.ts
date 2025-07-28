import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleSettingDto {
  @ApiProperty({
    description: 'Day of week (0 = Sunday, 6 = Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({
    description: 'Start time for the schedule',
    example: '09:00',
    pattern: 'HH:mm',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time for the schedule',
    example: '17:00',
    pattern: 'HH:mm',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  end_time: string;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent spiritual treatments',
    minimum: 1,
    default: 1,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_concurrent_spiritual?: number = 1;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent light bath treatments',
    minimum: 1,
    default: 1,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_concurrent_light_bath?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether the schedule is active',
    default: true,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

export class UpdateScheduleSettingDto {
  @ApiPropertyOptional({
    description: 'Day of week (0 = Sunday, 6 = Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(6)
  day_of_week?: number;

  @ApiPropertyOptional({
    description: 'Start time for the schedule',
    example: '09:00',
    pattern: 'HH:mm',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  start_time?: string;

  @ApiPropertyOptional({
    description: 'End time for the schedule',
    example: '17:00',
    pattern: 'HH:mm',
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  end_time?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent spiritual treatments',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_concurrent_spiritual?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent light bath treatments',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_concurrent_light_bath?: number;

  @ApiPropertyOptional({
    description: 'Whether the schedule is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class ScheduleSettingResponseDto {
  @ApiProperty({
    description: 'Schedule setting ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Day of week (0 = Sunday, 6 = Saturday)',
    example: 1,
  })
  day_of_week: number;

  @ApiProperty({
    description: 'Start time for the schedule',
    example: '09:00',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time for the schedule',
    example: '17:00',
  })
  end_time: string;

  @ApiProperty({
    description: 'Maximum number of concurrent spiritual treatments',
    example: 2,
  })
  max_concurrent_spiritual: number;

  @ApiProperty({
    description: 'Maximum number of concurrent light bath treatments',
    example: 2,
  })
  max_concurrent_light_bath: number;

  @ApiProperty({
    description: 'Whether the schedule is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-07-22T10:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-07-22T10:00:00Z',
  })
  updated_at: Date;
}
