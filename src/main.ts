import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig } from './config/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationException } from './common/exceptions/base.exception';
import { AppThrottlerGuard } from './common/guards/throttler.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Log database configuration
  console.log('Database Config:', {
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    database: configService.get('POSTGRES_DB'),
  });

  // Enable validation with detailed error messages and exception handling
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: process.env.NODE_ENV !== 'production',
      exceptionFactory: (errors) => {
        const details = errors.map((error) => ({
          field: error.property,
          value: error.value,
          constraints: error.constraints,
        }));
        return new ValidationException('Validation failed', details);
      },
    }),
  );

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply rate limiting
  app.useGlobalGuards(app.get(AppThrottlerGuard));

  // Enable CORS with configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger documentation setup
  const apiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, apiDocument);

  // Start the server
  const port = configService.get('PORT') || 3002;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}

bootstrap();
