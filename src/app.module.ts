import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';
import { PatientModule } from './modules/patient.module';
import { AttendanceModule } from './modules/attendance.module';
import { TreatmentRecordModule } from './modules/treatment-record.module';
import { TreatmentSessionModule } from './modules/treatment-session.module';
import { TreatmentSessionRecordModule } from './modules/treatment-session-record.module';
import { ScheduleSettingModule } from './modules/schedule-setting.module';
import { TimezoneController } from './controllers/timezone.controller';
import { AppThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    DatabaseModule,
    PatientModule,
    AttendanceModule,
    TreatmentRecordModule,
    TreatmentSessionModule,
    TreatmentSessionRecordModule,
    ScheduleSettingModule,
  ],
  controllers: [AppController, TimezoneController],
  providers: [AppService, AppThrottlerGuard],
})
export class AppModule {}
