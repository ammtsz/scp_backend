import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { SessionRecordStatus } from '../entities/treatment-session-record.entity';

export class CreateTreatmentSessionRecordDto {
  @IsNumber()
  @IsNotEmpty()
  treatment_session_id: number;

  @IsNumber()
  @IsOptional()
  attendance_id?: number;

  @IsNumber()
  @IsNotEmpty()
  session_number: number;

  @IsDateString()
  @IsNotEmpty()
  scheduled_date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  performed_by?: string;
}

export class UpdateTreatmentSessionRecordDto {
  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsEnum(SessionRecordStatus)
  @IsOptional()
  status?: SessionRecordStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  missed_reason?: string;

  @IsString()
  @IsOptional()
  performed_by?: string;

  @IsNumber()
  @IsOptional()
  attendance_id?: number;
}

export class TreatmentSessionRecordResponseDto {
  id: number;
  treatment_session_id: number;
  attendance_id?: number;
  session_number: number;
  scheduled_date: Date;
  start_time?: Date;
  end_time?: Date;
  status: SessionRecordStatus;
  notes?: string;
  missed_reason?: string;
  performed_by?: string;
  created_at: Date;
  updated_at: Date;
}
