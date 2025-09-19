# Timezone-Agnostic Database Schema Migration Plan

## Overview

Convert all date/time handling from timezone-dependent TIMESTAMP columns to timezone-agnostic DATE and TIME columns, storing all dates as strings in YYYY-MM-DD format and times as HH:MM:SS format.

## Schema Changes Required

### 1. Attendance Table (scp_attendance)

```sql
-- Current problematic columns:
checked_in_at TIMESTAMP        --> checked_in_date DATE + checked_in_time TIME
started_at TIMESTAMP           --> started_date DATE + started_time TIME
completed_at TIMESTAMP         --> completed_date DATE + completed_time TIME
cancelled_at TIMESTAMP         --> cancelled_date DATE + cancelled_time TIME
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME

-- Keep as-is (already timezone-agnostic):
scheduled_date DATE            ✅ No change needed
scheduled_time TIME            ✅ No change needed
```

### 2. Patient Table (scp_patient)

```sql
-- Current problematic columns:
birth_date DATE                ✅ No change needed
start_date DATE                ✅ No change needed
discharge_date DATE            ✅ No change needed
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME
```

### 3. Treatment Record Table (scp_treatment_record)

```sql
-- Current problematic columns:
treatment_start_time TIMESTAMP --> treatment_start_date DATE + treatment_start_time TIME
treatment_end_time TIMESTAMP   --> treatment_end_date DATE + treatment_end_time TIME
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME
```

### 4. Treatment Sessions Table (scp_treatment_sessions)

```sql
-- Current columns:
start_date DATE                ✅ No change needed
end_date DATE                  ✅ No change needed
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME
```

### 5. Treatment Session Records Table (scp_treatment_session_records)

```sql
-- Current problematic columns:
scheduled_date DATE            ✅ No change needed
start_time TIMESTAMP           --> start_date DATE + start_time TIME
end_time TIMESTAMP             --> end_date DATE + end_time TIME
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME
```

### 6. Schedule Settings Table (scp_schedule_setting)

```sql
-- Current columns:
start_time TIME                ✅ No change needed
end_time TIME                  ✅ No change needed
created_at TIMESTAMP           --> created_date DATE + created_time TIME
updated_at TIMESTAMP           --> updated_date DATE + updated_time TIME
```

## Data Format Standards

### Frontend ↔ Backend Communication

```typescript
// Date format: Always YYYY-MM-DD (ISO date string)
scheduledDate: "2025-09-18"

// Time format: Always HH:MM:SS (24-hour format)
scheduledTime: "14:30:00"

// Date-time combinations sent as separate fields:
{
  checkedInDate: "2025-09-18",
  checkedInTime: "14:25:30"
}
```

### Database Storage

```sql
-- All dates stored as DATE type
checked_in_date DATE

-- All times stored as TIME type
checked_in_time TIME

-- No more TIMESTAMP columns except where absolutely necessary
```

## Benefits of This Approach

1. **No Timezone Issues**: DATE and TIME types are timezone-agnostic
2. **Consistent Data**: Dates always mean the same thing regardless of server timezone
3. **Simpler Logic**: No more timezone conversions in application code
4. **Better Performance**: Simpler date operations without timezone calculations
5. **Database Independence**: Works the same across different database timezones

## Implementation Strategy

Since you mentioned database reset is an option, we can:

1. **Drop and recreate schema** with new column structure
2. **Update TypeORM entities** to use string types for dates
3. **Modify DTOs** to handle date/time strings
4. **Simplify frontend utilities** by removing timezone conversions
5. **Update tests** to work with string dates

## Migration Considerations

- All existing data will need to be converted during migration
- Application code needs to be updated to handle string dates
- Need to ensure consistent date/time formatting across all components
- Update validation rules to work with string formats
