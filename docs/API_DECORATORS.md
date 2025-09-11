# API Decorators Documentation

This document describes the API decorators available for the treatment session and treatment session record controllers.

## Treatment Session Decorators

Location: `src/decorators/api-treatment-session.decorator.ts`

### Available Decorators

#### `@ApiCreateTreatmentSessionOperation()`

- **Purpose**: Decorates the endpoint for creating a new treatment session
- **HTTP Status**: 201 Created
- **Usage**: Applied to POST endpoints that create treatment sessions
- **Includes**: Validation responses, conflict handling, authentication checks

#### `@ApiGetTreatmentSessionsByPatientOperation()`

- **Purpose**: Decorates the endpoint for retrieving treatment sessions by patient ID
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that fetch sessions for a specific patient
- **Includes**: Patient validation, authentication checks

#### `@ApiGetTreatmentSessionsByTreatmentRecordOperation()`

- **Purpose**: Decorates the endpoint for retrieving treatment sessions by treatment record ID
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that fetch sessions for a specific treatment record
- **Includes**: Treatment record validation, authentication checks

#### `@ApiTreatmentSessionOperation(summary: string)`

- **Purpose**: Base decorator for general treatment session operations
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that need custom summaries
- **Parameters**:
  - `summary`: Custom operation description

#### `@ApiUpdateTreatmentSessionOperation()`

- **Purpose**: Decorates the endpoint for updating treatment sessions
- **HTTP Status**: 200 OK
- **Usage**: Applied to PUT endpoints that modify treatment sessions
- **Includes**: Validation responses, not found handling

#### `@ApiDeleteTreatmentSessionOperation()`

- **Purpose**: Decorates the endpoint for deleting treatment sessions
- **HTTP Status**: 204 No Content
- **Usage**: Applied to DELETE endpoints that remove treatment sessions
- **Includes**: Cascade deletion warnings, authentication checks

#### `@ApiGetTreatmentStatsOperation()`

- **Purpose**: Decorates the endpoint for retrieving treatment statistics
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that return analytics data
- **Includes**: Detailed response schema for statistics

## Treatment Session Record Decorators

Location: `src/decorators/api-treatment-session-record.decorator.ts`

### Available Decorators

#### `@ApiCreateSessionRecordOperation()`

- **Purpose**: Decorates the endpoint for creating session records
- **HTTP Status**: 201 Created
- **Usage**: Applied to POST endpoints that create individual session records
- **Includes**: Conflict detection for duplicate session numbers

#### `@ApiGetSessionRecordsBySessionOperation()`

- **Purpose**: Decorates the endpoint for retrieving session records by treatment session
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that fetch records for a specific treatment session

#### `@ApiTreatmentSessionRecordOperation(summary: string)`

- **Purpose**: Base decorator for general session record operations
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that need custom summaries
- **Parameters**:
  - `summary`: Custom operation description

#### `@ApiUpdateSessionRecordOperation()`

- **Purpose**: Decorates the endpoint for updating session records
- **HTTP Status**: 200 OK
- **Usage**: Applied to PUT endpoints that modify session records

#### `@ApiDeleteSessionRecordOperation()`

- **Purpose**: Decorates the endpoint for deleting session records
- **HTTP Status**: 204 No Content
- **Usage**: Applied to DELETE endpoints that remove session records

#### `@ApiCompleteSessionOperation()`

- **Purpose**: Decorates the endpoint for marking sessions as completed
- **HTTP Status**: 200 OK
- **Usage**: Applied to POST endpoints that complete sessions
- **Body Schema**: `{ attendanceId?: number; notes?: string }`
- **Includes**: Conflict detection for already completed sessions

#### `@ApiMarkSessionMissedOperation()`

- **Purpose**: Decorates the endpoint for marking sessions as missed
- **HTTP Status**: 200 OK
- **Usage**: Applied to POST endpoints that mark sessions as missed
- **Body Schema**: `{ reason: string }`
- **Includes**: Required reason validation

#### `@ApiRescheduleSessionOperation()`

- **Purpose**: Decorates the endpoint for rescheduling sessions
- **HTTP Status**: 200 OK
- **Usage**: Applied to POST endpoints that reschedule sessions
- **Body Schema**: `{ newDate: string }`
- **Includes**: Date format validation

#### `@ApiGetUpcomingSessionsForPatientOperation()`

- **Purpose**: Decorates the endpoint for retrieving upcoming sessions
- **HTTP Status**: 200 OK
- **Usage**: Applied to GET endpoints that fetch upcoming sessions for patients
- **Query Parameters**: `days` (optional, default: 7)

## Usage Examples

### Treatment Session Controller

```typescript
@Controller('treatment-sessions')
export class TreatmentSessionController {
  @Post()
  @ApiCreateTreatmentSessionOperation()
  async createTreatmentSession(@Body() dto: CreateTreatmentSessionDto) {
    // Implementation
  }

  @Get('patient/:patientId')
  @ApiGetTreatmentSessionsByPatientOperation()
  async getTreatmentSessionsByPatient(@Param('patientId') patientId: number) {
    // Implementation
  }

  @Get(':id')
  @ApiTreatmentSessionOperation('Get treatment session by ID')
  async getTreatmentSessionById(@Param('id') id: number) {
    // Implementation
  }
}
```

### Treatment Session Record Controller

```typescript
@Controller('treatment-session-records')
export class TreatmentSessionRecordController {
  @Post()
  @ApiCreateSessionRecordOperation()
  async createSessionRecord(@Body() dto: CreateTreatmentSessionRecordDto) {
    // Implementation
  }

  @Post(':id/complete')
  @ApiCompleteSessionOperation()
  async completeSession(
    @Param('id') id: number,
    @Body() body: { attendanceId?: number; notes?: string },
  ) {
    // Implementation
  }

  @Post(':id/mark-missed')
  @ApiMarkSessionMissedOperation()
  async markSessionMissed(
    @Param('id') id: number,
    @Body() body: { reason: string },
  ) {
    // Implementation
  }
}
```

## Benefits

1. **Consistency**: All decorators follow the same pattern as existing API decorators
2. **Documentation**: Automatic Swagger documentation generation with detailed responses
3. **Type Safety**: Proper TypeScript integration with DTOs and response types
4. **Error Handling**: Comprehensive HTTP status code coverage
5. **Maintainability**: Centralized API documentation logic
6. **Reusability**: Decorators can be easily applied to multiple endpoints

## Testing

All decorators include comprehensive test coverage:

- `api-treatment-session.decorator.spec.ts`
- `api-treatment-session-record.decorator.spec.ts`

Tests verify that decorators are properly defined and return valid decorator functions.
