# Exception Handling Guidelines

## Overview

This document outlines the exception handling patterns and best practices for the MVP Center backend application.

## Exception Types

### 1. Base Exceptions

- `BaseException`: Base class for all custom exceptions
- `ResourceNotFoundException`: Used when a requested resource doesn't exist

### 2. Domain-Specific Exceptions

#### Patient Exceptions

- `DuplicatePatientException`: When attempting to create a patient that already exists
- `InvalidPatientPriorityException`: When an invalid priority is assigned
- `TreatmentStatusUpdateException`: When an invalid treatment status transition is attempted
- `PatientHasActiveAttendancesException`: When trying to delete a patient with active attendances
- `InvalidPhoneFormatException`: When phone number format is invalid

#### Attendance Exceptions

- `AttendanceScheduleConflictException`: When scheduling conflicts occur
- `InvalidAttendanceTypeException`: When an invalid attendance type is provided
- `InvalidAttendanceStatusTransitionException`: When an invalid status transition is attempted
- `AttendanceTimeSlotUnavailableException`: When a time slot is not available

#### Treatment Record Exceptions

- `DuplicateTreatmentRecordException`: When attempting to create duplicate records
- `InvalidAttendanceStatusException`: When attendance status is invalid for treatment
- `InvalidReturnWeeksException`: When return weeks value is invalid

#### Schedule Setting Exceptions

- `InvalidScheduleTimeException`: When schedule time is invalid
- `ScheduleSettingConflictException`: When schedule settings conflict
- `InvalidConcurrentAttendancesException`: When concurrent attendance limits are violated
- `ScheduleSettingInUseException`: When trying to delete an active schedule

## Best Practices

1. **Use NestJS Built-in Exceptions**
   - Use `BadRequestException` for validation errors
   - Use `UnauthorizedException` for authentication errors
   - Use `ForbiddenException` for authorization errors
   - Use `NotFoundException` for simple resource not found cases

2. **Domain-Specific Exceptions**
   - Create specific exceptions for business logic errors
   - Include relevant error details in the exception
   - Use descriptive names that reflect the business case

3. **Error Response Format**

   ```typescript
   {
     statusCode: number;    // HTTP status code
     message: string;       // User-friendly message
     error: string;        // Error type/category
     details?: unknown;    // Additional context (optional)
   }
   ```

4. **Exception Handling Flow**
   1. Service Layer: Throw domain-specific exceptions
   2. Controller Layer: Let exceptions propagate
   3. Global Filter: Format and return error response

## Examples

### Throwing Exceptions

```typescript
// Bad - Generic exception
throw new BadRequestException('Invalid data');

// Good - Domain-specific exception
throw new InvalidPatientPriorityException(
  priority,
  Object.values(PatientPriority),
);
```

### Handling Database Errors

```typescript
try {
  await this.repository.save(entity);
} catch (error) {
  if (error.code === '23505') { // Unique violation
    throw new DuplicatePatientException(...);
  }
  throw error;
}
```

### Status Transition Validation

```typescript
if (!isValidTransition(currentStatus, newStatus)) {
  throw new InvalidAttendanceStatusTransitionException(
    attendanceId,
    currentStatus,
    newStatus,
  );
}
```
