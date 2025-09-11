import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min, Max, ValidateIf } from 'class-validator';
import { TreatmentType } from '../entities/treatment-session.entity';

export class CreateTreatmentSessionDto {
  @IsNumber()
  @IsNotEmpty()
  treatment_record_id: number;

  @IsNumber()
  @IsNotEmpty()
  attendance_id: number;

  @IsNumber()
  @IsNotEmpty()
  patient_id: number;

  @IsEnum(TreatmentType)
  @IsNotEmpty()
  treatment_type: TreatmentType;

  @IsString()
  @IsNotEmpty()
  body_location: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  planned_sessions: number;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  // Light bath specific fields (required when treatment_type = 'light_bath')
  @ValidateIf(o => o.treatment_type === TreatmentType.LIGHT_BATH)
  @IsNumber()
  @Min(1)
  @Max(10) // 10 units = 70 minutes max
  duration_minutes?: number;

  @ValidateIf(o => o.treatment_type === TreatmentType.LIGHT_BATH)
  @IsString()
  @IsNotEmpty()
  color?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTreatmentSessionDto {
  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  completed_sessions?: number;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TreatmentSessionResponseDto {
  id: number;
  treatment_record_id: number;
  attendance_id: number;
  patient_id: number;
  treatment_type: TreatmentType;
  body_location: string;
  start_date: Date;
  planned_sessions: number;
  completed_sessions: number;
  end_date?: Date;
  status: string;
  duration_minutes?: number;
  color?: string;
  notes?: string;
  sessionRecords?: any[];
  created_at: Date;
  updated_at: Date;
}
