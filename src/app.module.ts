import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';
import { PatientModule } from './modules/patient.module';
import { AttendanceModule } from './modules/attendance.module';
import { TreatmentRecordModule } from './modules/treatment-record.module';
import { ScheduleSettingModule } from './modules/schedule-setting.module';
import { AppThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    ScheduleSettingModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppThrottlerGuard],
})
export class AppModule {}
