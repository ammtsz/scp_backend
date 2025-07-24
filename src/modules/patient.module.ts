import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Attendance } from '../entities/attendance.entity';
import { PatientController } from '../controllers/patient.controller';
import { PatientService } from '../services/patient.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Attendance])],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
