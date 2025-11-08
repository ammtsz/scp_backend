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
  const databaseUrl = configService.get('DATABASE_URL');
  if (databaseUrl) {
    console.log('Database Config: Using DATABASE_URL (Railway/Production)');
    // Don't log the full DATABASE_URL for security reasons
    console.log('Database Provider: Railway PostgreSQL');
  } else {
    console.log(
      'Database Config: Using individual environment variables (Local Development)',
    );
    console.log('Database Details:', {
      host: configService.get('POSTGRES_HOST'),
      port: configService.get('POSTGRES_PORT'),
      username: configService.get('POSTGRES_USER'),
      database: configService.get('POSTGRES_DB'),
    });
  }

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
    credentials: true, // Allow credentials
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger documentation setup
  const apiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, apiDocument);

  // Start the server - Railway provides PORT, fallback to 3002 for local
  const port = configService.get('PORT') || process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Railway

  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  console.log(`✅ Application started successfully!`);
  console.log(`Environment: ${environment}`);
  console.log(`Port: ${port}`);

  if (isProduction) {
    console.log(`🚂 Railway deployment detected`);
    console.log(`🌐 Application URL: Available in Railway dashboard`);
    console.log(`📚 Swagger API docs: /api endpoint`);
  } else {
    console.log(`🏠 Local development mode`);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(
      `Swagger documentation available at: http://localhost:${port}/api`,
    );
  }

  // Log CORS configuration
  const corsOrigin = configService.get('CORS_ORIGIN');
  if (corsOrigin) {
    console.log(`🔒 CORS configured for: ${corsOrigin}`);
  } else {
    console.log(`⚠️  CORS set to allow all origins (development mode)`);
  }
}

bootstrap();
