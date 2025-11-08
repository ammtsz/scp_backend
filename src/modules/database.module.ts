import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Attendance } from '../entities/attendance.entity';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Railway provides DATABASE_URL, fall back to individual vars for local development
        const databaseUrl = configService.get('DATABASE_URL');

        if (databaseUrl) {
          // Railway production configuration using DATABASE_URL
          console.log('Using DATABASE_URL for connection');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false, // Schema managed manually via init.sql to avoid timezone conversion issues
            ssl:
              process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        } else {
          // Local development configuration using individual environment variables
          console.log('Using individual environment variables for connection');
          return {
            type: 'postgres',
            host: configService.get('POSTGRES_HOST'),
            port: +configService.get('POSTGRES_PORT'),
            username: configService.get('POSTGRES_USER'),
            password: configService.get('POSTGRES_PASSWORD'),
            database: configService.get('POSTGRES_DB'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: false, // Schema managed manually via init.sql to avoid timezone conversion issues
          };
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Patient,
      Attendance,
      TreatmentRecord,
      ScheduleSetting,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
