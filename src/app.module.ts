import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';
import { PatientModule } from './modules/patient.module';
import { AttendanceModule } from './modules/attendance.module';
import { TreatmentRecordModule } from './modules/treatment-record.module';
import { ScheduleSettingModule } from './modules/schedule-setting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PatientModule,
    AttendanceModule,
    TreatmentRecordModule,
    ScheduleSettingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
