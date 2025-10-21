/**
 * Timezone utility functions for handling timezone conversions and validation
 */

/**
 * List of supported timezones (can be expanded as needed)
 */
export const SUPPORTED_TIMEZONES = [
  'America/Sao_Paulo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'America/Seattle'
] as const;

/**
 * Default timezone for the application (Brazil)
 */
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * Validates if a timezone string is a valid IANA timezone
 * @param timezone The timezone string to validate
 * @returns boolean indicating if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Use Intl.DateTimeFormat to validate the timezone
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the current date/time in a specific timezone
 * @param timezone The IANA timezone identifier
 * @returns Object with date and time strings in YYYY-MM-DD and HH:MM:SS format
 */
export function getCurrentDateTimeInTimezone(timezone: string) {
  const now = new Date();
  
  // Format date as YYYY-MM-DD
  const date = now.toLocaleDateString('en-CA', { timeZone: timezone });
  
  // Format time as HH:MM:SS
  const time = now.toLocaleTimeString('en-GB', { 
    timeZone: timezone,
    hour12: false 
  });
  
  return { date, time };
}

/**
 * Converts a date/time from one timezone to another
 * @param dateString Date in YYYY-MM-DD format
 * @param timeString Time in HH:MM:SS format
 * @param fromTimezone Source timezone
 * @param toTimezone Target timezone
 * @returns Object with converted date and time strings
 */
export function convertDateTimeBetweenTimezones(
  dateString: string,
  timeString: string,
  fromTimezone: string,
  toTimezone: string
) {
  // Create a Date object in the source timezone
  const dateTime = new Date(`${dateString}T${timeString}`);
  
  // Convert to target timezone
  const targetDate = dateTime.toLocaleDateString('en-CA', { timeZone: toTimezone });
  const targetTime = dateTime.toLocaleTimeString('en-GB', { 
    timeZone: toTimezone,
    hour12: false 
  });
  
  return { date: targetDate, time: targetTime };
}

/**
 * Gets timezone offset in hours from UTC
 * @param timezone The IANA timezone identifier
 * @returns Offset in hours (can be fractional)
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
  const offset = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
  return offset;
}