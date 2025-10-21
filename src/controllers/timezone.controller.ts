import { Controller, Get, Query, Param } from '@nestjs/common';
import { 
  isValidTimezone, 
  DEFAULT_TIMEZONE, 
  SUPPORTED_TIMEZONES,
  getCurrentDateTimeInTimezone,
  getTimezoneOffset
} from '../common/utils/timezone.utils';

@Controller('timezone')
export class TimezoneController {
  
  /**
   * GET /api/timezone
   * Returns the default timezone and current server time
   * Can optionally detect timezone from browser via query parameter
   */
  @Get()
  getTimezoneInfo(@Query('browser_timezone') browserTimezone?: string) {
    const defaultTz = DEFAULT_TIMEZONE;
    const serverDateTime = getCurrentDateTimeInTimezone(defaultTz);
    
    // Validate browser timezone if provided
    let detectedTimezone = defaultTz;
    let isValidBrowserTimezone = false;
    
    if (browserTimezone && isValidTimezone(browserTimezone)) {
      detectedTimezone = browserTimezone;
      isValidBrowserTimezone = true;
    }
    
    const detectedDateTime = detectedTimezone !== defaultTz 
      ? getCurrentDateTimeInTimezone(detectedTimezone)
      : serverDateTime;
    
    return {
      server: {
        timezone: defaultTz,
        date: serverDateTime.date,
        time: serverDateTime.time,
        offset: getTimezoneOffset(defaultTz)
      },
      detected: {
        timezone: detectedTimezone,
        date: detectedDateTime.date,
        time: detectedDateTime.time,
        offset: getTimezoneOffset(detectedTimezone),
        isValidBrowserTimezone
      },
      supportedTimezones: SUPPORTED_TIMEZONES
    };
  }
  
  /**
   * GET /api/timezone/validate/:timezone
   * Validates if a timezone is supported
   */
  @Get('validate/:timezone')
  validateTimezone(@Param('timezone') timezone: string) {
    // URL decode the timezone parameter (handles slashes in timezone names)
    const decodedTimezone = decodeURIComponent(timezone);
    const isValid = isValidTimezone(decodedTimezone);
    
    let currentDateTime = null;
    let offset = null;
    
    if (isValid) {
      currentDateTime = getCurrentDateTimeInTimezone(decodedTimezone);
      offset = getTimezoneOffset(decodedTimezone);
    }
    
    return {
      timezone: decodedTimezone,
      isValid,
      isSupported: SUPPORTED_TIMEZONES.includes(decodedTimezone as any),
      currentDateTime,
      offset
    };
  }
  
  /**
   * GET /api/timezone/current/:timezone
   * Gets current date/time in a specific timezone
   */
  @Get('current/:timezone')
  getCurrentInTimezone(@Param('timezone') timezone: string) {
    const decodedTimezone = decodeURIComponent(timezone);
    
    if (!isValidTimezone(decodedTimezone)) {
      return {
        error: 'Invalid timezone',
        timezone: decodedTimezone,
        fallback: getCurrentDateTimeInTimezone(DEFAULT_TIMEZONE)
      };
    }
    
    const dateTime = getCurrentDateTimeInTimezone(decodedTimezone);
    
    return {
      timezone: decodedTimezone,
      date: dateTime.date,
      time: dateTime.time,
      offset: getTimezoneOffset(decodedTimezone)
    };
  }
}