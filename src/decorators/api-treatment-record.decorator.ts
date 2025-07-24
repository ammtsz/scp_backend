import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import {
  UpdateTreatmentRecordDto,
  TreatmentRecordResponseDto,
} from '../dtos/treatment-record.dto';

export function ApiTreatmentRecordOperation(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({
      status: 200,
      description: 'Operation successful',
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
      description: 'Not found - Requested resource does not exist',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiCreateTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new treatment record',
      description: 'Creates a new treatment record for an attendance.',
    }),
    ApiResponse({
      status: 201,
      description: 'Treatment record created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid treatment record data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not found - Related attendance not found',
    }),
    ApiResponse({
      status: 409,
      description:
        'Conflict - Treatment record already exists for this attendance',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiUpdateTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a treatment record',
      description: 'Updates an existing treatment record with new information.',
    }),
    ApiParam({ name: 'id', description: 'Treatment Record ID' }),
    ApiBody({ type: UpdateTreatmentRecordDto }),
    ApiResponse({
      status: 200,
      description: 'Treatment record updated successfully',
      type: TreatmentRecordResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid treatment record data',
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

export function ApiDeleteTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a treatment record',
      description: 'Deletes an existing treatment record.',
    }),
    ApiParam({ name: 'id', description: 'Treatment Record ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment record deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Treatment record not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiFindAllTreatmentRecordsOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all treatment records',
      description: 'Retrieves a list of all treatment records.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of treatment records retrieved successfully',
      type: [TreatmentRecordResponseDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiFindOneTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get treatment record by ID',
      description: 'Retrieves a specific treatment record by its ID.',
    }),
    ApiParam({ name: 'id', description: 'Treatment Record ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment record retrieved successfully',
      type: TreatmentRecordResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Treatment record not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}

export function ApiFindByAttendanceTreatmentRecordOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get treatment record by attendance ID',
      description: 'Retrieves treatment records for a specific attendance.',
    }),
    ApiParam({ name: 'id', description: 'Attendance ID' }),
    ApiResponse({
      status: 200,
      description: 'Treatment records retrieved successfully',
      type: [TreatmentRecordResponseDto],
    }),
    ApiResponse({
      status: 404,
      description: 'No treatment records found for this attendance',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
