import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateTreatmentRecordException extends HttpException {
  constructor(attendanceId: number, existingRecordId: number) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Cannot create treatment record: Attendance (ID: ${attendanceId}) already has a treatment record (ID: ${existingRecordId})`,
        error: 'Duplicate Treatment Record',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidAttendanceStatusException extends HttpException {
  constructor(attendanceId: number, status: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cannot create treatment record: Attendance (ID: ${attendanceId}) has invalid status: ${status}`,
        error: 'Invalid Attendance Status',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidReturnWeeksException extends HttpException {
  constructor(weeks: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Return weeks must be between 1 and 52, got: ${weeks}`,
        error: 'Invalid Return Weeks',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
