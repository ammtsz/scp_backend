# Database Migrations

This document describes how to manage database schema changes using TypeORM migrations.

## Overview

This project uses TypeORM migrations to handle database schema changes in a controlled, versioned manner. Migrations ensure that database changes are applied consistently across different environments.

## Phase 2 Migration: Enhanced Treatment Records

The migration `1692708000000-AddTreatmentRecordPhase2Fields.ts` adds the following fields to the `scp_treatment_record` table:

### New Fields Added:

- **`location TEXT[]`** - Array of treatment locations (e.g., ['Coronário', 'Lombar'])
- **`custom_location TEXT`** - Optional custom location field
- **`quantity INTEGER`** - Number of treatment applications (1-10, default: 1)
- **`treatment_start_time TIMESTAMP`** - When treatment session started
- **`treatment_end_time TIMESTAMP`** - When treatment session ended

### Constraints Added:

- **Quantity Validation**: Ensures quantity is between 1 and 10
- **Time Order Validation**: Ensures end time is after start time

## Available Migration Commands

### Run Migrations

```bash
npm run migration:run
```

Applies all pending migrations to the database.

### Revert Last Migration

```bash
npm run migration:revert
```

Reverts the last applied migration.

### Show Migration Status

```bash
npm run migration:show
```

Shows which migrations have been applied.

## Phase 3 Migration: Absence Notes Support

The migration `1725530000000-AddAbsenceNotesToAttendance.ts` adds support for storing specific notes about patient absences:

### New Field Added:

- **`absence_notes TEXT`** - Optional field for storing detailed notes explaining the reason for absence when marking attendance as missed

This field is separate from the general `notes` field and is specifically used when:

- Marking an attendance as MISSED status
- Providing justification details for absence management
- Maintaining audit trail of absence reasons

### Usage:

```typescript
// Frontend API call
await markAttendanceAsMissed(attendanceId, true, "Patient had medical emergency");

// Backend DTO
{
  absence_justified: true,
  absence_notes: "Patient had medical emergency"
}
```

### Generate New Migration

```bash
npm run migration:generate src/migrations/MigrationName
```

Generates a new migration based on entity changes.

### Create Empty Migration

```bash
npm run migration:create src/migrations/MigrationName
```

Creates an empty migration file for custom SQL.

## Environment Setup

Make sure your `.env` file contains the correct database connection settings:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=scp_db
```

## Production Considerations

1. **Always backup your database** before running migrations in production
2. **Test migrations in a staging environment** first
3. **Review migration SQL** before applying to production
4. **Use transactions** for complex migrations to ensure rollback capability

## Migration Best Practices

1. **Keep migrations atomic** - Each migration should represent a single logical change
2. **Write reversible migrations** - Always implement both `up` and `down` methods
3. **Test rollbacks** - Ensure your `down` method properly reverses the `up` changes
4. **Add comments** - Document what each migration does and why
5. **Use constraints** - Add database-level validation where appropriate

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error message in the console
2. Verify database connection settings
3. Ensure the database user has proper permissions
4. Check for data conflicts (e.g., constraint violations)

### Rollback Issues

If you need to manually fix a failed rollback:

1. Check the `typeorm_migrations` table
2. Manually revert problematic changes
3. Update the migration status in the table

## Related Files

- `src/data-source.ts` - TypeORM data source configuration
- `src/migrations/` - Migration files directory
- `src/entities/treatment-record.entity.ts` - Enhanced entity with Phase 2 fields
- `init.sql` - Initial database schema (updated for Phase 2)
