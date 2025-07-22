# SCP Spiritual Center Database Queries Documentation

This document contains common queries, examples, and best practices for the SCP Spiritual Center database.

## Table of Contents

1. [Scheduling Management](#scheduling-management)
   - [Finding Available Slots](#finding-available-slots)
   - [Schedule Validation](#schedule-validation)
   - [Capacity Management](#capacity-management)
2. [Patient Management](#patient-management)
   - [Patient Search](#patient-search)
   - [Treatment History](#treatment-history)
   - [Status Updates](#status-updates)
3. [Attendance Tracking](#attendance-tracking)
   - [Daily Schedule](#daily-schedule)
   - [Follow-up Management](#follow-up-management)
   - [Attendance Flow](#attendance-flow)
4. [Reports and Analytics](#reports-and-analytics)
   - [Dashboard Statistics](#dashboard-statistics)
   - [Treatment Effectiveness](#treatment-effectiveness)
   - [Resource Utilization](#resource-utilization)

## Finding Available Slots

Query to find available time slots for a specific day, considering concurrent treatment limits:

```sql
SELECT
    generate_series(start_time, end_time, interval '30 minutes') as time_slot,
    max_concurrent_spiritual - COALESCE(COUNT(a.id) FILTER (WHERE a.type = 'spiritual'), 0) as spiritual_slots_left,
    max_concurrent_light_bath - COALESCE(COUNT(a.id) FILTER (WHERE a.type = 'light_bath'), 0) as light_bath_slots_left
FROM scp_schedule_setting s
LEFT JOIN scp_attendance a
    ON a.scheduled_time::time = time_slot::time
    AND a.scheduled_date = :date
WHERE s.day_of_week = EXTRACT(DOW FROM :date)
GROUP BY time_slot, max_concurrent_spiritual, max_concurrent_light_bath
HAVING max_concurrent_spiritual - COALESCE(COUNT(a.id) FILTER (WHERE a.type = 'spiritual'), 0) > 0
    OR max_concurrent_light_bath - COALESCE(COUNT(a.id) FILTER (WHERE a.type = 'light_bath'), 0) > 0;
```

**Usage:**

- Replace `:date` with the date you want to check
- Returns available slots and remaining capacity for each treatment type
- Only shows slots with at least one available space

## Patient Treatment History

Recursive query to get a patient's complete treatment history:

```sql
WITH RECURSIVE treatment_chain AS (
    -- Get the initial treatment
    SELECT tr.*, a.scheduled_date, 1 as visit_number
    FROM scp_treatment_record tr
    JOIN scp_attendance a ON tr.attendance_id = a.id
    WHERE a.patient_id = :patient_id
    AND a.scheduled_date = (
        SELECT MIN(scheduled_date)
        FROM scp_attendance
        WHERE patient_id = :patient_id
    )

    UNION ALL

    -- Get subsequent treatments
    SELECT tr.*, a.scheduled_date, tc.visit_number + 1
    FROM scp_treatment_record tr
    JOIN scp_attendance a ON tr.attendance_id = a.id
    JOIN treatment_chain tc ON a.scheduled_date > tc.scheduled_date
    WHERE a.patient_id = :patient_id
)
SELECT * FROM treatment_chain
ORDER BY scheduled_date;
```

**Usage:**

- Replace `:patient_id` with the patient's ID
- Returns chronological treatment history
- Includes visit numbering

## Follow-up Management

Find patients who are due for follow-up:

```sql
SELECT
    p.name,
    p.priority,
    tr.return_in_weeks,
    a.completed_at + (tr.return_in_weeks * interval '1 week') as due_date,
    NOW() - (a.completed_at + (tr.return_in_weeks * interval '1 week')) as overdue
FROM scp_patient p
JOIN scp_attendance a ON p.id = a.patient_id
JOIN scp_treatment_record tr ON a.id = tr.attendance_id
WHERE a.status = 'completed'
AND NOT EXISTS (
    SELECT 1
    FROM scp_attendance a2
    WHERE a2.patient_id = p.id
    AND a2.scheduled_date > a.scheduled_date
)
AND a.completed_at + (tr.return_in_weeks * interval '1 week') < CURRENT_DATE
ORDER BY overdue DESC;
```

**Usage:**

- No parameters needed
- Shows patients who haven't returned within their recommended timeframe
- Ordered by most overdue first

## Dashboard Statistics

Get daily statistics for the medical center:

```sql
SELECT
    COUNT(*) FILTER (WHERE a.status = 'scheduled') as total_scheduled,
    COUNT(*) FILTER (WHERE a.status = 'completed') as total_completed,
    COUNT(*) FILTER (WHERE a.status = 'cancelled') as total_cancelled,
    AVG(EXTRACT(EPOCH FROM (a.completed_at - a.started_at))/60)::integer as avg_treatment_minutes,
    COUNT(DISTINCT a.patient_id) as unique_patients,
    COUNT(*) FILTER (WHERE p.priority = '1') as emergency_cases
FROM scp_attendance a
JOIN scp_patient p ON a.patient_id = p.id
WHERE a.scheduled_date = CURRENT_DATE;
```

**Usage:**

- Shows current day's statistics
- Includes average treatment duration
- Counts emergency cases

## Patient Management

### Patient Search

Find patients by various criteria:

```sql
SELECT p.*,
       COUNT(a.id) as total_visits,
       MAX(a.scheduled_date) as last_visit,
       STRING_AGG(DISTINCT tr.food, '; ') as dietary_recommendations
FROM scp_patient p
LEFT JOIN scp_attendance a ON p.id = a.patient_id
LEFT JOIN scp_treatment_record tr ON a.id = tr.attendance_id
WHERE (
    LOWER(p.name) LIKE LOWER(:search) OR
    p.phone LIKE :search OR
    LOWER(p.main_complaint) LIKE LOWER(:search)
)
AND p.status = ANY(:status_array)
GROUP BY p.id
ORDER BY p.priority ASC, p.created_at DESC;
```

### Treatment Types Analysis

Track treatment effectiveness by type:

```sql
SELECT
    a.type,
    COUNT(*) as total_treatments,
    AVG(tr.return_in_weeks) as avg_return_weeks,
    COUNT(*) FILTER (WHERE p.status = 'finished') as successful_treatments,
    ROUND(COUNT(*) FILTER (WHERE p.status = 'finished')::numeric / COUNT(*) * 100, 2) as success_rate
FROM scp_attendance a
JOIN scp_patient p ON a.patient_id = p.id
LEFT JOIN scp_treatment_record tr ON a.id = tr.attendance_id
WHERE a.status = 'completed'
GROUP BY a.type
ORDER BY total_treatments DESC;
```

### Patient Status History

```sql
SELECT
    p.name,
    p.status,
    COUNT(a.id) as total_visits,
    MAX(a.scheduled_date) as last_visit
FROM scp_patient p
LEFT JOIN scp_attendance a ON p.id = a.patient_id
WHERE p.id = :patient_id
GROUP BY p.id, p.name, p.status;
```

### Find Conflicting Appointments

```sql
SELECT
    a1.id as appointment1_id,
    a2.id as appointment2_id,
    a1.scheduled_time,
    a1.type as type1,
    a2.type as type2
FROM scp_attendance a1
JOIN scp_attendance a2 ON
    a1.scheduled_date = a2.scheduled_date
    AND a1.scheduled_time = a2.scheduled_time
    AND a1.id < a2.id
WHERE a1.scheduled_date = :date;
```

## Schedule Management

### Weekly Schedule Overview

Get a weekly schedule with capacity information:

```sql
WITH RECURSIVE time_slots AS (
    SELECT generate_series(
        date_trunc('week', CURRENT_DATE),
        date_trunc('week', CURRENT_DATE) + interval '6 days',
        interval '1 day'
    ) as date
)
SELECT
    ts.date,
    to_char(ts.date, 'Day') as day_name,
    s.start_time,
    s.end_time,
    s.max_concurrent_spiritual,
    s.max_concurrent_light_bath,
    COUNT(a.id) FILTER (WHERE a.type = 'spiritual') as spiritual_booked,
    COUNT(a.id) FILTER (WHERE a.type = 'light_bath') as light_bath_booked
FROM time_slots ts
LEFT JOIN scp_schedule_setting s ON EXTRACT(DOW FROM ts.date) = s.day_of_week
LEFT JOIN scp_attendance a ON ts.date = a.scheduled_date
WHERE s.is_active = true
GROUP BY ts.date, s.start_time, s.end_time, s.max_concurrent_spiritual, s.max_concurrent_light_bath
ORDER BY ts.date;
```

### Resource Utilization

Track treatment room usage and capacity:

```sql
SELECT
    date_trunc('hour', a.scheduled_time) as hour_block,
    a.type,
    COUNT(*) as sessions,
    SUM(EXTRACT(EPOCH FROM (a.completed_at - a.started_at))/3600) as total_hours,
    ROUND(AVG(EXTRACT(EPOCH FROM (a.completed_at - a.started_at))/60)) as avg_minutes
FROM scp_attendance a
WHERE a.status = 'completed'
AND a.scheduled_date BETWEEN :start_date AND :end_date
GROUP BY hour_block, a.type
ORDER BY hour_block;
```

## Performance Tips and Best Practices

1. Utilize existing indexes for optimal performance:
   - `idx_attendances_date_time` for scheduling queries
   - `idx_patients_name` for patient searches
   - `idx_patients_status` for status filtering
   - `idx_patients_priority` for priority sorting
   - `idx_attendances_timestamps` for timeline analysis

2. For large datasets, consider using window functions:

   ```sql
   SELECT
       *,
       LAG(scheduled_date) OVER (PARTITION BY patient_id ORDER BY scheduled_date)
           as previous_visit
   FROM scp_attendance;
   ```

3. Use parameterized queries to prevent SQL injection and improve query plan reuse

4. Use EXPLAIN ANALYZE to check query performance:

   ```sql
   EXPLAIN ANALYZE your_query_here;
   ```

5. For large date ranges, use date-based partitioning:
   ```sql
   -- Example: Get attendance by month
   SELECT date_trunc('month', scheduled_date) as month,
          COUNT(*) as total_attendances
   FROM scp_attendance
   GROUP BY 1
   ORDER BY 1;
   ```
