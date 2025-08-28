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
