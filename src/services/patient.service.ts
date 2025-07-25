import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Attendance } from '../entities/attendance.entity';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';
import { AttendanceStatus, TreatmentStatus } from '../common/enums';
import {
  ValidationException,
  DuplicatePatientException,
  InvalidPatientPriorityException,
  TreatmentStatusUpdateException,
  PatientHasActiveAttendancesException,
} from '../common/exceptions';
@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Check for duplicate patient
    const existingPatient = await this.patientRepository.findOne({
      where: {
        name: createPatientDto.name,
        phone: createPatientDto.phone,
      },
    });

    if (existingPatient) {
      throw new DuplicatePatientException(
        createPatientDto.name,
        createPatientDto.phone,
        existingPatient.id,
      );
    }

    // Validate priority if it exists in the DTO
    if (createPatientDto.priority) {
      const allowedPriorities = ['1', '2', '3'];
      if (!allowedPriorities.includes(createPatientDto.priority)) {
        throw new InvalidPatientPriorityException(
          createPatientDto.priority,
          allowedPriorities,
        );
      }
    }

    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(
    id: number,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);

    if (Object.keys(updatePatientDto).length === 0) {
      throw new ValidationException(
        'At least one field must be provided for update',
      );
    }

    if (
      updatePatientDto.treatment_status &&
      updatePatientDto.treatment_status !== patient.treatment_status
    ) {
      // Define valid status transitions
      const validTransitions: Record<TreatmentStatus, TreatmentStatus[]> = {
        [TreatmentStatus.IN_TREATMENT]: [
          TreatmentStatus.DISCHARGED,
          TreatmentStatus.ABSENT,
        ],
        [TreatmentStatus.DISCHARGED]: [
          TreatmentStatus.IN_TREATMENT,
          TreatmentStatus.ABSENT,
        ],
        [TreatmentStatus.ABSENT]: [
          TreatmentStatus.IN_TREATMENT,
          TreatmentStatus.DISCHARGED,
        ],
      };

      if (
        !validTransitions[patient.treatment_status]?.includes(
          updatePatientDto.treatment_status,
        )
      ) {
        throw new TreatmentStatusUpdateException(
          id,
          patient.treatment_status,
          updatePatientDto.treatment_status,
          'Invalid treatment status transition',
        );
      }
    }

    if (updatePatientDto.priority) {
      const allowedPriorities = ['1', '2', '3'];
      if (!allowedPriorities.includes(updatePatientDto.priority)) {
        throw new InvalidPatientPriorityException(
          updatePatientDto.priority,
          allowedPriorities,
        );
      }
    }

    this.patientRepository.merge(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  async remove(id: number): Promise<void> {
    // Check for active attendances
    const activeAttendances = await this.attendanceRepository.count({
      where: {
        patient_id: id,
        status: AttendanceStatus.SCHEDULED, // Add other active statuses if needed
      },
    });

    if (activeAttendances > 0) {
      throw new PatientHasActiveAttendancesException(id, activeAttendances);
    }

    const result = await this.patientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }
}
