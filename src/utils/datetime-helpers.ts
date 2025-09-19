/**
 * Utility functions for converting between timezone-agnostic date/time pairs and timestamp strings
 */

/**
 * Combine date and time strings into ISO timestamp string
 * @param dateStr YYYY-MM-DD format
 * @param timeStr HH:MM:SS format
 * @returns ISO timestamp string or null if either parameter is null/undefined
 */
export function combineDateTimeToTimestamp(dateStr: string | null, timeStr: string | null): string | null {
  if (!dateStr || !timeStr) return null;
  
  // Combine date and time strings and create ISO string
  // Note: This creates a local time timestamp without timezone conversion
  return `${dateStr}T${timeStr}`;
}

/**
 * Split ISO timestamp string into date and time components
 * @param timestamp ISO timestamp string
 * @returns Object with date and time strings, or null values if timestamp is null
 */
export function splitTimestampToDateTime(timestamp: string | null): { date: string | null; time: string | null } {
  if (!timestamp) return { date: null, time: null };
  
  const [date, time] = timestamp.split('T');
  return {
    date: date || null,
    time: time ? time.split('.')[0] : null // Remove milliseconds if present
  };
}

/**
 * Get current date as YYYY-MM-DD string
 */
export function getCurrentDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current time as HH:MM:SS string
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}
