import {
  Injectable,
  HttpException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { Patient } from '../entities/patient.entity';
import { TreatmentSessionService } from './treatment-session.service';
import { AttendanceService } from './attendance.service';
import { TreatmentType } from '../entities/treatment-session.entity';
import { AttendanceType } from '../common/enums';
import {
  CreateTreatmentRecordDto,
  UpdateTreatmentRecordDto,
} from '../dtos/treatment-record.dto';
import {
  DuplicateTreatmentRecordException,
  InvalidReturnWeeksException,
  InvalidAttendanceStatusException,
} from '../common/exceptions';

@Injectable()
export class TreatmentRecordService {
  constructor(
    @InjectRepository(TreatmentRecord)
    private treatmentRecordRepository: Repository<TreatmentRecord>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private treatmentSessionService: TreatmentSessionService,
    private attendanceService: AttendanceService,
  ) {}

  async create(
    createTreatmentRecordDto: CreateTreatmentRecordDto,
  ): Promise<TreatmentRecord> {
    try {
      // Validate return weeks
      if (
        createTreatmentRecordDto.return_in_weeks &&
        (createTreatmentRecordDto.return_in_weeks <= 0 ||
          createTreatmentRecordDto.return_in_weeks > 52)
      ) {

        throw new InvalidReturnWeeksException(
          createTreatmentRecordDto.return_in_weeks,
        );
      }

      // Check for existing record
      const existingRecord = await this.treatmentRecordRepository.findOne({
        where: { attendance_id: createTreatmentRecordDto.attendance_id },
      });

      if (existingRecord) {
        throw new DuplicateTreatmentRecordException(
          createTreatmentRecordDto.attendance_id,
          existingRecord.id,
        );
      }

      // Check attendance status
      const attendance = await this.attendanceRepository.findOne({
        where: { id: createTreatmentRecordDto.attendance_id },
        relations: ['patient'],
      });

      if (!attendance) {
        throw new NotFoundException(
          `Attendance with ID ${createTreatmentRecordDto.attendance_id} not found`,
        );
      }

      // Extract treatment_status for patient update (not stored in treatment record)
      const { treatment_status, ...treatmentRecordData } = createTreatmentRecordDto;

      const record = this.treatmentRecordRepository.create(treatmentRecordData);

      // Set treatment timing if not provided
      if (!record.start_time) {
        record.start_time = new Date().toTimeString().split(' ')[0].substring(0, 8); // HH:MM:SS
      }
      
      // If this is a completed treatment, set end_time
      if (attendance.status === 'completed' && !record.end_time) {
        record.end_time = new Date().toTimeString().split(' ')[0].substring(0, 8); // HH:MM:SS
      }

      // Validate parent treatment relationship if specified
      if (record.parent_treatment_id) {
        const parentTreatment = await this.treatmentRecordRepository.findOne({
          where: { id: record.parent_treatment_id },
          relations: ['attendance', 'attendance.patient'],
        });

        if (!parentTreatment) {
          throw new NotFoundException(
            `Parent treatment with ID ${record.parent_treatment_id} not found`
          );
        }

        // Ensure the parent treatment belongs to the same patient
        if (parentTreatment.attendance.patient_id !== attendance.patient_id) {
          throw new BadRequestException(
            'Parent treatment must belong to the same patient'
          );
        }

        // Ensure parent treatment is a root treatment (parent_treatment_id should be null)
        if (parentTreatment.parent_treatment_id !== null) {
          throw new BadRequestException(
            'Parent treatment must be a root treatment (main consultation)'
          );
        }
      }

      const savedRecord = await this.treatmentRecordRepository.save(record);

      // Update patient's main_complaint if this is a new treatment episode or new patient
      await this.updatePatientMainComplaint(savedRecord, attendance);

      // Update patient's treatment status if provided
      if (treatment_status && treatment_status !== attendance?.patient.treatment_status) {
        await this.patientRepository.update(attendance.patient_id, {
          treatment_status: treatment_status as any,
          // Set discharge_date if status is 'A' (Alta médica)
          discharge_date: treatment_status === 'A' ? new Date().toISOString().split('T')[0] : undefined,
        });
      }

      // Auto-create next attendance based on return_in_weeks, but only if treatment_status is not 'A' (dismissed)
      if (savedRecord.return_in_weeks && 
          savedRecord.return_in_weeks > 0 && 
          attendance.patient.treatment_status !== 'A') {
        
        await this.createNextAttendance(savedRecord, attendance);
      }

      return savedRecord;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Handle database-specific errors
      if (error.code === '23505') {
        // unique_violation
        const match = error.detail.match(/Key \(attendance_id\)=\((\d+)\)/);
        const attendanceId = match ? parseInt(match[1]) : -1;
        throw new DuplicateTreatmentRecordException(attendanceId, -1);
      }
      throw error;
    }
  }

  async findAll(): Promise<TreatmentRecord[]> {
    return await this.treatmentRecordRepository.find({
      relations: ['attendance', 'attendance.patient'],
    });
  }

  async findOne(id: number): Promise<TreatmentRecord> {
    const record = await this.treatmentRecordRepository.findOne({
      where: { id },
      relations: ['attendance', 'attendance.patient'],
    });
    if (!record) {
      throw new NotFoundException(`Treatment record with ID ${id} not found`);
    }
    return record;
  }

  async findByAttendance(attendanceId: number): Promise<TreatmentRecord> {
    const record = await this.treatmentRecordRepository.findOne({
      where: { attendance_id: attendanceId },
      relations: ['attendance', 'attendance.patient'],
    });
    if (!record) {
      throw new NotFoundException(
        `Treatment record not found for attendance ${attendanceId}`,
      );
    }
    return record;
  }

  async update(id: number, updateData: UpdateTreatmentRecordDto): Promise<TreatmentRecord> {
    // Extract treatment_status for patient update (not stored in treatment record)
    const { treatment_status, ...treatmentRecordUpdateData } = updateData;

    // Update the treatment record
    await this.treatmentRecordRepository.update(id, treatmentRecordUpdateData);
    const updatedRecord = await this.findOne(id);

    // Update patient's treatment status if provided
    if (treatment_status) {
      const attendance = await this.attendanceRepository.findOne({
        where: { id: updatedRecord.attendance_id },
        relations: ['patient'],
      });

      if (attendance && treatment_status !== attendance.patient.treatment_status) {
        await this.patientRepository.update(attendance.patient_id, {
          treatment_status: treatment_status as any,
          // Set discharge_date if status is 'A' (Alta médica)
          discharge_date: treatment_status === 'A' ? new Date().toISOString().split('T')[0] : undefined,
        });
      }
    }

    return updatedRecord;
  }

  async remove(id: number): Promise<void> {
    const result = await this.treatmentRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment record with ID ${id} not found`);
    }
  }

  /**
   * Create next attendance based on return_in_weeks recommendation
   */
  private async createNextAttendance(
    treatmentRecord: TreatmentRecord,
    currentAttendance: Attendance
  ): Promise<void> {
    try {
      // Calculate next appointment date
      const nextDate = new Date(currentAttendance.scheduled_date);
      nextDate.setDate(nextDate.getDate() + (treatmentRecord.return_in_weeks * 7));

      // Create next attendance
      await this.attendanceService.create({
        patient_id: currentAttendance.patient_id,
        type: AttendanceType.SPIRITUAL, // Follow-up is always spiritual consultation
        scheduled_date: nextDate.toISOString().split('T')[0],
        scheduled_time: currentAttendance.scheduled_time, // Same time as current
        notes: `Retorno agendado automaticamente - ${treatmentRecord.return_in_weeks} semana(s) após consulta anterior`,
      });

      console.log(
        `✅ Auto-created next attendance for patient ${currentAttendance.patient_id} on ${nextDate.toISOString().split('T')[0]}`
      );
    } catch (error) {
      console.error(
        `❌ Error creating next attendance for treatment record ${treatmentRecord.id}:`,
        error
      );
      // Don't throw - this is a helpful feature but shouldn't break the main flow
    }
  }

  /**
   * Updates the patient's main_complaint based on treatment record logic
   * Updates when:
   * - New patient (treatment_status = 'N')
   * - New treatment episode (parent_treatment_id is null)
   * - Complaint is different from current patient complaint
   */
  private async updatePatientMainComplaint(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<void> {
    try {
      // Only update if there's a main_complaint in the treatment record
      if (!treatmentRecord.main_complaint?.trim()) {
        return;
      }

      // Get the current patient data
      const patient = await this.patientRepository.findOne({
        where: { id: attendance.patient_id }
      });

      if (!patient) {
        console.warn(`Patient not found for ID: ${attendance.patient_id}`);
        return;
      }

      // Determine if we should update the patient's main_complaint
      const shouldUpdate = 
        // New patient
        patient.treatment_status === 'N' ||
        // New treatment episode (not a follow-up)
        !treatmentRecord.parent_treatment_id ||
        // Complaint is different from current patient complaint
        patient.main_complaint !== treatmentRecord.main_complaint;

      if (shouldUpdate) {
        await this.patientRepository.update(
          { id: attendance.patient_id },
          { 
            main_complaint: treatmentRecord.main_complaint,
            updated_date: new Date().toISOString().split('T')[0],
            updated_time: new Date().toTimeString().split(' ')[0].substring(0, 8)
          }
        );
        
        console.log(
          `✅ Updated patient ${attendance.patient_id} main_complaint: "${treatmentRecord.main_complaint}"`
        );
      } else {
        console.log(
          `ℹ️ Patient ${attendance.patient_id} main_complaint unchanged (follow-up or same complaint)`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error updating patient main_complaint for patient ${attendance.patient_id}:`,
        error
      );
      // Don't throw - this shouldn't break the treatment record creation
    }
  }
}
