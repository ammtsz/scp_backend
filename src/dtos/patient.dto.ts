import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientPriority, PatientStatus } from '../common/enums';

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
    description: 'Patient current status',
    enum: PatientStatus,
    default: PatientStatus.NEW,
    example: PatientStatus.NEW,
  })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus = PatientStatus.NEW;

  @ApiPropertyOptional({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birth_date?: Date;

  @ApiPropertyOptional({
    description: 'Main health complaint',
    example: 'Frequent headaches',
  })
  @IsString()
  @IsOptional()
  main_complaint?: string;
}

export class UpdatePatientDto extends CreatePatientDto {
  @ApiPropertyOptional({
    description: 'Patient discharge date',
    example: '2025-12-31',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  discharge_date?: Date;
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
    description: 'Patient current status',
    enum: PatientStatus,
    example: PatientStatus.NEW,
  })
  status: PatientStatus;

  @ApiPropertyOptional({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  birth_date?: Date;

  @ApiPropertyOptional({
    description: 'Main health complaint',
    example: 'Frequent headaches',
  })
  main_complaint?: string;

  @ApiPropertyOptional({
    description: 'Patient discharge date',
    example: '2025-12-31',
  })
  discharge_date?: Date;

  @ApiProperty({
    description: 'Treatment start date',
    example: '2025-07-22',
  })
  start_date: Date;

  @ApiProperty({
    description: 'Record creation date',
    example: '2025-07-22T10:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Record last update date',
    example: '2025-07-22T10:00:00Z',
  })
  updated_at: Date;
}
