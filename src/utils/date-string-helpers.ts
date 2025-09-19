/**
 * Timezone-agnostic date string utilities
 * All dates are handled as strings in YYYY-MM-DD format to avoid timezone conversion issues
 */

/**
 * Format a Date object to YYYY-MM-DD string (timezone-agnostic)
 * Uses local date components to avoid timezone conversion
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to Date object (timezone-agnostic)
 * Creates date in local timezone to avoid UTC conversion
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Add days to a date string and return new date string
 * @param dateStr YYYY-MM-DD format
 * @param days Number of days to add (can be negative)
 * @returns New date string in YYYY-MM-DD format
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToString(date);
}

/**
 * Get today's date as YYYY-MM-DD string (timezone-agnostic)
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}

/**
 * Compare two date strings
 * @returns negative if date1 < date2, positive if date1 > date2, 0 if equal
 */
export function compareDateStrings(date1: string, date2: string): number {
  return date1.localeCompare(date2);
}

/**
 * Check if a date string is valid YYYY-MM-DD format
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const date = parseDateString(dateStr);
  return formatDateToString(date) === dateStr;
}

/**
 * Get the start date for treatment sessions based on a reference date
 * If today is Tuesday or later in the week, start next Tuesday
 * If today is Monday, start today
 */
export function getNextTuesdayString(referenceDate?: string): string {
  const today = referenceDate ? parseDateString(referenceDate) : new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  
  let daysToAdd = 0;
  if (dayOfWeek === 1) {
    // Monday - start today
    daysToAdd = 0;
  } else if (dayOfWeek === 0) {
    // Sunday - start tomorrow (Monday)
    daysToAdd = 1;
  } else {
    // Tuesday or later - start next Monday
    daysToAdd = 8 - dayOfWeek;
  }
  
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + daysToAdd);
  return formatDateToString(startDate);
}
