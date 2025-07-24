import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class DuplicateTreatmentRecordException extends BaseException {
  constructor(attendanceId: number, existingRecordId: number) {
    super(
      `Cannot create treatment record: Attendance (ID: ${attendanceId}) already has a treatment record (ID: ${existingRecordId})`,
      'Duplicate Treatment Record',
      HttpStatus.CONFLICT,
      { attendanceId, existingRecordId },
    );
  }
}

export class InvalidAttendanceStatusException extends BaseException {
  constructor(attendanceId: number, status: string) {
    super(
      `Cannot create treatment record: Attendance (ID: ${attendanceId}) has invalid status: ${status}`,
      'Invalid Attendance Status',
      HttpStatus.BAD_REQUEST,
      { attendanceId, status },
    );
  }
}

export class InvalidReturnWeeksException extends BaseException {
  constructor(weeks: number) {
    super(
      `Return weeks must be between 1 and 52, got: ${weeks}`,
      'Invalid Return Weeks',
      HttpStatus.BAD_REQUEST,
      { weeks },
    );
  }
}
