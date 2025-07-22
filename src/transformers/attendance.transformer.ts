import { Attendance } from '../entities/attendance.entity';
import { AttendanceResponseDto } from '../dtos/attendance.dto';

export class AttendanceTransformer {
    static toResponseDto(attendance: Attendance): AttendanceResponseDto {
        return {
            id: attendance.id,
            patient_id: attendance.patient_id,
            type: attendance.type,
            status: attendance.status,
            scheduled_date: attendance.scheduled_date.toISOString().split('T')[0],
            scheduled_time: attendance.scheduled_time,
            checked_in_at: attendance.checked_in_at,
            started_at: attendance.started_at,
            completed_at: attendance.completed_at,
            cancelled_at: attendance.cancelled_at,
            notes: attendance.notes,
            created_at: attendance.created_at,
            updated_at: attendance.updated_at
        };
    }

    static toResponseDtoList(attendances: Attendance[]): AttendanceResponseDto[] {
        return attendances.map(attendance => this.toResponseDto(attendance));
    }
}
