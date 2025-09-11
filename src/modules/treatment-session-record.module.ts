import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentSessionRecord } from '../entities/treatment-session-record.entity';
import { TreatmentSession } from '../entities/treatment-session.entity';
import { Attendance } from '../entities/attendance.entity';
import { TreatmentSessionRecordService } from '../services/treatment-session-record.service';
import { TreatmentSessionRecordController } from '../controllers/treatment-session-record.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreatmentSessionRecord,
      TreatmentSession,
      Attendance,
    ]),
  ],
  controllers: [TreatmentSessionRecordController],
  providers: [TreatmentSessionRecordService],
  exports: [TreatmentSessionRecordService],
})
export class TreatmentSessionRecordModule {}
