import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('MVP Center API')
  .setDescription(
    `The MVP Center API provides endpoints for managing patient attendances, treatment records, and scheduling in a medical center.

    ## Features
    - Patient Management
    - Attendance Scheduling
    - Treatment Records
    - Schedule Settings
    
    ## Authentication
    All endpoints are protected and require a valid authentication token.
    
    ## Rate Limiting
    API calls are limited to 100 requests per minute per IP.`,
  )
  .setVersion('1.0')
  .addBearerAuth()
  .addTag(
    'Attendances',
    'Manage patient attendances including scheduling, check-in, and completion',
  )
  .addTag(
    'Patients',
    'Manage patient records including registration and medical history',
  )
  .addTag(
    'Treatment Records',
    'Manage treatment records and follow-up recommendations',
  )
  .addTag('Schedule Settings', 'Configure daily schedule settings and capacity')
  .setContact(
    'MVP Center Support',
    'https://mvp-center.com',
    'support@mvp-center.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .build();
