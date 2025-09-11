import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { AttendanceController } from '../controllers/attendance.controller';
import { AttendanceService } from '../services/attendance.service';
import { TreatmentSessionRecordModule } from './treatment-session-record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, ScheduleSetting]),
    TreatmentSessionRecordModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
