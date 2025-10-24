import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientNote } from '../entities/patient-note.entity';
import { Attendance } from '../entities/attendance.entity';
import { PatientController } from '../controllers/patient.controller';
import { PatientService } from '../services/patient.service';
import { PatientNoteService } from '../services/patient-note.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientNote, Attendance])],
  controllers: [PatientController],
  providers: [PatientService, PatientNoteService],
  exports: [PatientService, PatientNoteService],
})
export class PatientModule {}
