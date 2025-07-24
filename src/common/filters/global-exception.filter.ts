import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Global exception filter that handles all unhandled exceptions in the application.
 *
 * Error Handling Strategy:
 * 1. HTTP Exceptions (NestJS and custom):
 *    - Preserves the status code and error message
 *    - Formats response consistently using ErrorResponse interface
 *
 * 2. Database Errors (TypeORM):
 *    - Converts database errors to appropriate HTTP responses
 *    - Special handling for common cases:
 *      * Unique constraint violations (23505) -> 409 Conflict
 *      * Foreign key violations (23503) -> 400 Bad Request
 *
 * 3. Unexpected Errors:
 *    - Converts to 500 Internal Server Error
 *    - Logs error details for debugging
 *    - Returns safe error message to client
 *
 * Usage:
 * - Let this filter handle all standard HTTP exceptions
 * - Create domain-specific exceptions for business logic errors
 * - Use TypeORM's QueryFailedError for database operation failures
 */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      message =
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message
          : exceptionResponse;

      error = exceptionResponse.error || exception.name;
    } else if (exception instanceof QueryFailedError) {
      // Handle database specific errors
      status = HttpStatus.BAD_REQUEST;
      message = (exception as any).detail || 'Database operation failed';
      error = 'Database Error';

      // Check for specific database error codes
      if ((exception as any).code === '23505') {
        message = 'Duplicate entry found';
        error = 'Conflict';
        status = HttpStatus.CONFLICT;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
