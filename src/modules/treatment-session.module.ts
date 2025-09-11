import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentSession } from '../entities/treatment-session.entity';
import { TreatmentSessionRecord } from '../entities/treatment-session-record.entity';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { Patient } from '../entities/patient.entity';
import { TreatmentSessionService } from '../services/treatment-session.service';
import { TreatmentSessionController } from '../controllers/treatment-session.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreatmentSession,
      TreatmentSessionRecord,
      TreatmentRecord,
      Attendance,
      Patient,
    ]),
  ],
  controllers: [TreatmentSessionController],
  providers: [TreatmentSessionService],
  exports: [TreatmentSessionService],
})
export class TreatmentSessionModule {}
