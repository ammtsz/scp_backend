import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Attendance } from '../entities/attendance.entity';
import { CreatePatientDto, UpdatePatientDto } from '../dtos/patient.dto';
import { AttendanceStatus } from '../common/enums';
import {
  ValidationException,
  DuplicatePatientException,
  InvalidPatientPriorityException,
  PatientStatusUpdateException,
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

    if (updatePatientDto.status && updatePatientDto.status !== patient.status) {
      // Define valid status transitions
      const validTransitions = {
        new: ['in_progress', 'active', 'terminated', 'finished'],
        in_progress: ['active', 'terminated'],
        active: ['terminated'],
        terminated: [],
        finished: [],
      };

      if (
        !validTransitions[patient.status]?.includes(updatePatientDto.status)
      ) {
        throw new PatientStatusUpdateException(
          id,
          patient.status,
          updatePatientDto.status,
          'Invalid status transition',
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
