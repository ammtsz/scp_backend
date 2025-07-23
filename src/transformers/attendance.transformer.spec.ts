import { AttendanceTransformer } from './attendance.transformer';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceType, AttendanceStatus } from '../common/enums';

describe('AttendanceTransformer', () => {
  const mockDate = new Date('2025-07-22');
  const mockCheckedInDate = new Date('2025-07-22T14:25:00.000Z');
  const mockStartedDate = new Date('2025-07-22T14:35:00.000Z');
  const mockCompletedDate = new Date('2025-07-22T15:00:00.000Z');

  const mockAttendance: Partial<Attendance> = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: mockDate,
    scheduled_time: '14:30',
    checked_in_at: mockCheckedInDate,
    started_at: mockStartedDate,
    completed_at: mockCompletedDate,
    cancelled_at: null,
    notes: 'Test notes',
    created_at: mockDate,
    updated_at: mockDate,
  };

  describe('toResponseDto', () => {
    it('should transform an attendance entity to response dto', () => {
      const result = AttendanceTransformer.toResponseDto(mockAttendance as Attendance);

      expect(result).toEqual({
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        checked_in_at: mockCheckedInDate,
        started_at: mockStartedDate,
        completed_at: mockCompletedDate,
        cancelled_at: null,
        notes: 'Test notes',
        created_at: mockDate,
        updated_at: mockDate,
      });
    });

    it('should handle null dates correctly', () => {
      const attendanceWithNullDates: Partial<Attendance> = {
        ...mockAttendance,
        checked_in_at: null,
        started_at: null,
        completed_at: null,
      };

      const result = AttendanceTransformer.toResponseDto(attendanceWithNullDates as Attendance);

      expect(result.checked_in_at).toBeNull();
      expect(result.started_at).toBeNull();
      expect(result.completed_at).toBeNull();
    });
  });

  describe('toResponseDtoList', () => {
    it('should transform an array of attendance entities to response dtos', () => {
      const attendances = [mockAttendance, mockAttendance] as Attendance[];
      const results = AttendanceTransformer.toResponseDtoList(attendances);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toEqual({
          id: 1,
          patient_id: 1,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: '2025-07-22',
          scheduled_time: '14:30',
          checked_in_at: mockCheckedInDate,
          started_at: mockStartedDate,
          completed_at: mockCompletedDate,
          cancelled_at: null,
          notes: 'Test notes',
          created_at: mockDate,
          updated_at: mockDate,
        });
      });
    });

    it('should return empty array when input is empty', () => {
      const results = AttendanceTransformer.toResponseDtoList([]);
      expect(results).toEqual([]);
    });
  });
});
