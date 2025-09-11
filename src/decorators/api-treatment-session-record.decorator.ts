import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  CreateTreatmentSessionRecordDto,
  UpdateTreatmentSessionRecordDto,
  TreatmentSessionRecordResponseDto,
} from '../dtos/treatment-session-record.dto';

/**
 * Base decorator for treatment session record operations
 */
export function ApiTreatmentSessionRecordOperation(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({
      status: 200,
      description: 'Operation successful',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record does not exist',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for creating a new session record
 */
export function ApiCreateSessionRecordOperation() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({
      summary: 'Create new session record',
      description: 'Creates a new session record for a treatment session.',
    }),
    ApiBody({ type: CreateTreatmentSessionRecordDto }),
    ApiResponse({
      status: 201,
      description: 'Session record created successfully',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid session record data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Treatment session not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Session record already exists for this session number',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for updating a session record
 */
export function ApiUpdateSessionRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update session record',
      description: 'Updates an existing session record with new information.',
    }),
    ApiParam({ name: 'id', description: 'Session Record ID' }),
    ApiBody({ type: UpdateTreatmentSessionRecordDto }),
    ApiResponse({
      status: 200,
      description: 'Session record updated successfully',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid session record data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for deleting a session record
 */
export function ApiDeleteSessionRecordOperation() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({
      summary: 'Delete session record',
      description: 'Deletes a session record permanently.',
    }),
    ApiParam({ name: 'id', description: 'Session Record ID' }),
    ApiResponse({
      status: 204,
      description: 'Session record deleted successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for getting session records by treatment session
 */
export function ApiGetSessionRecordsBySessionOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get session records by treatment session',
      description: 'Retrieves all session records for a specific treatment session.',
    }),
    ApiParam({ name: 'sessionId', description: 'Treatment Session ID' }),
    ApiResponse({
      status: 200,
      description: 'Session records retrieved successfully',
      type: [TreatmentSessionRecordResponseDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Treatment session not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for completing a session
 */
export function ApiCompleteSessionOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete a session',
      description: 'Marks a session as completed and records completion details.',
    }),
    ApiParam({ name: 'id', description: 'Session Record ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          attendanceId: { type: 'number', description: 'Associated attendance ID (optional)' },
          notes: { type: 'string', description: 'Completion notes (optional)' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Session completed successfully',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid completion data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Session already completed',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for marking a session as missed
 */
export function ApiMarkSessionMissedOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Mark session as missed',
      description: 'Marks a session as missed with the provided reason.',
    }),
    ApiParam({ name: 'id', description: 'Session Record ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for missing the session', example: 'Patient did not show up' },
        },
        required: ['reason'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Session marked as missed successfully',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Missing or invalid reason',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Session already completed or missed',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for rescheduling a session
 */
export function ApiRescheduleSessionOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reschedule a session',
      description: 'Reschedules a session to a new date.',
    }),
    ApiParam({ name: 'id', description: 'Session Record ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          newDate: { type: 'string', format: 'date', description: 'New scheduled date', example: '2024-01-15' },
        },
        required: ['newDate'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Session rescheduled successfully',
      type: TreatmentSessionRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid new date',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Session record not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Session already completed',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for getting upcoming sessions for a patient
 */
export function ApiGetUpcomingSessionsForPatientOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get upcoming sessions for patient',
      description: 'Retrieves upcoming session records for a specific patient.',
    }),
    ApiParam({ name: 'patientId', description: 'Patient ID' }),
    ApiQuery({ name: 'days', description: 'Number of days to look ahead', required: false, example: 7 }),
    ApiResponse({
      status: 200,
      description: 'Upcoming sessions retrieved successfully',
      type: [TreatmentSessionRecordResponseDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Patient not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
