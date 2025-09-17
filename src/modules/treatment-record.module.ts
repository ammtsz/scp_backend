import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { TreatmentRecordController } from '../controllers/treatment-record.controller';
import { TreatmentRecordService } from '../services/treatment-record.service';
import { TreatmentSessionModule } from './treatment-session.module';
import { AttendanceModule } from './attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TreatmentRecord, Attendance]),
    TreatmentSessionModule,
    AttendanceModule,
  ],
  controllers: [TreatmentRecordController],
  providers: [TreatmentRecordService],
  exports: [TreatmentRecordService],
})
export class TreatmentRecordModule {}
