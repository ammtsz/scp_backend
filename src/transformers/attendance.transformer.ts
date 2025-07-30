import { Attendance } from '../entities/attendance.entity';
import { AttendanceResponseDto, AttendanceAgendaDto, NextAttendanceDateDto } from '../dtos/attendance.dto';
import { PatientResponseDto } from '../dtos/patient.dto';

export class AttendanceTransformer {
  static toResponseDto(attendance: Attendance): AttendanceResponseDto {
    const response: AttendanceResponseDto = {
      id: attendance.id,
      patient_id: attendance.patient_id,
      type: attendance.type,
      status: attendance.status,
      scheduled_date:
        attendance.scheduled_date instanceof Date
          ? attendance.scheduled_date.toISOString().split('T')[0]
          : attendance.scheduled_date,
      scheduled_time: attendance.scheduled_time,
      checked_in_at: attendance.checked_in_at,
      started_at: attendance.started_at,
      completed_at: attendance.completed_at,
      cancelled_at: attendance.cancelled_at,
      notes: attendance.notes,
      created_at: attendance.created_at,
      updated_at: attendance.updated_at,
    };

    // Include patient data if available
    if (attendance.patient) {
      response.patient = {
        id: attendance.patient.id,
        name: attendance.patient.name,
        phone: attendance.patient.phone,
        priority: attendance.patient.priority,
        treatment_status: attendance.patient.treatment_status,
        birth_date: attendance.patient.birth_date,
        main_complaint: attendance.patient.main_complaint,
        start_date: attendance.patient.start_date,
        discharge_date: attendance.patient.discharge_date,
        created_at: attendance.patient.created_at,
        updated_at: attendance.patient.updated_at,
      };
    }

    return response;
  }

  static toResponseDtoList(attendances: Attendance[]): AttendanceResponseDto[] {
    return attendances.map((attendance) => this.toResponseDto(attendance));
  }

  // Transform raw query result to agenda DTO
  static toAgendaDto(rawData: any): AttendanceAgendaDto {
    return {
      id: rawData.attendance_id,
      patient_id: rawData.attendance_patient_id,
      type: rawData.attendance_type,
      status: rawData.attendance_status,
      scheduled_date: rawData.attendance_scheduled_date instanceof Date
        ? rawData.attendance_scheduled_date.toISOString().split('T')[0]
        : rawData.attendance_scheduled_date,
      notes: rawData.attendance_notes,
      patient_name: rawData.patient_name || `Paciente ${rawData.attendance_patient_id}`,
      patient_priority: rawData.patient_priority || 'NORMAL',
    };
  }

  static toAgendaDtoList(rawDataList: any[]): AttendanceAgendaDto[] {
    return rawDataList.map((rawData) => this.toAgendaDto(rawData));
  }

  // Transform date string to next attendance date DTO
  static toNextDateDto(dateString: string | null): NextAttendanceDateDto {
    return {
      next_date: dateString || new Date().toISOString().split('T')[0],
    };
  }
}
