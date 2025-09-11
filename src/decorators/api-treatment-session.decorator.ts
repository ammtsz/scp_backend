import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  CreateTreatmentSessionDto,
  UpdateTreatmentSessionDto,
  TreatmentSessionResponseDto,
} from '../dtos/treatment-session.dto';

/**
 * Base decorator for treatment session operations
 */
export function ApiTreatmentSessionOperation(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({
      status: 200,
      description: 'Operation successful',
      type: TreatmentSessionResponseDto,
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
      description: 'Not found - Treatment session does not exist',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for creating a new treatment session
 */
export function ApiCreateTreatmentSessionOperation() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({
      summary: 'Create new treatment session',
      description: 'Creates a new treatment session plan for a patient with the specified parameters.',
    }),
    ApiBody({ type: CreateTreatmentSessionDto }),
    ApiResponse({
      status: 201,
      description: 'Treatment session created successfully',
      type: TreatmentSessionResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid treatment session data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Related treatment record or patient not found',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Treatment session already exists for this treatment record',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for updating a treatment session
 */
export function ApiUpdateTreatmentSessionOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update treatment session',
      description: 'Updates an existing treatment session with new information.',
    }),
    ApiParam({ name: 'id', description: 'Treatment Session ID' }),
    ApiBody({ type: UpdateTreatmentSessionDto }),
    ApiResponse({
      status: 200,
      description: 'Treatment session updated successfully',
      type: TreatmentSessionResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid treatment session data',
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
 * Decorator for deleting a treatment session
 */
export function ApiDeleteTreatmentSessionOperation() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({
      summary: 'Delete treatment session',
      description: 'Deletes a treatment session and all associated session records.',
    }),
    ApiParam({ name: 'id', description: 'Treatment Session ID' }),
    ApiResponse({
      status: 204,
      description: 'Treatment session deleted successfully',
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
 * Decorator for getting treatment sessions by patient
 */
export function ApiGetTreatmentSessionsByPatientOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get treatment sessions by patient',
      description: 'Retrieves all treatment sessions for a specific patient.',
    }),
    ApiParam({ name: 'patientId', description: 'Patient ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment sessions retrieved successfully',
      type: [TreatmentSessionResponseDto],
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

/**
 * Decorator for getting treatment sessions by treatment record
 */
export function ApiGetTreatmentSessionsByTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get treatment sessions by treatment record',
      description: 'Retrieves all treatment sessions associated with a specific treatment record.',
    }),
    ApiParam({ name: 'treatmentRecordId', description: 'Treatment Record ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment sessions retrieved successfully',
      type: [TreatmentSessionResponseDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Treatment record not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

/**
 * Decorator for getting treatment statistics
 */
export function ApiGetTreatmentStatsOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get treatment statistics',
      description: 'Retrieves comprehensive statistics for a patient\'s treatment sessions.',
    }),
    ApiParam({ name: 'patientId', description: 'Patient ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment statistics retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          totalSessions: { type: 'number', description: 'Total number of planned sessions' },
          completedSessions: { type: 'number', description: 'Number of completed sessions' },
          missedSessions: { type: 'number', description: 'Number of missed sessions' },
          scheduledSessions: { type: 'number', description: 'Number of upcoming scheduled sessions' },
          completionRate: { type: 'number', description: 'Completion rate as percentage' },
        },
      },
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
