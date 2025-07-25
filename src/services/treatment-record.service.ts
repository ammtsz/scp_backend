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
      });

      if (!attendance) {
        throw new NotFoundException(
          `Attendance with ID ${createTreatmentRecordDto.attendance_id} not found`,
        );
      }

      if (attendance.status !== 'completed') {
        throw new InvalidAttendanceStatusException(
          attendance.id,
          attendance.status,
        );
      }

      const record = this.treatmentRecordRepository.create(
        createTreatmentRecordDto,
      );
      return await this.treatmentRecordRepository.save(record);
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

  async update(
    id: number,
    updateTreatmentRecordDto: UpdateTreatmentRecordDto,
  ): Promise<TreatmentRecord> {
    const record = await this.findOne(id);

    if (Object.keys(updateTreatmentRecordDto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    if (
      updateTreatmentRecordDto.return_in_weeks &&
      (updateTreatmentRecordDto.return_in_weeks <= 0 ||
        updateTreatmentRecordDto.return_in_weeks > 52)
    ) {
      throw new BadRequestException(
        `Invalid return weeks value: ${updateTreatmentRecordDto.return_in_weeks}. Must be between 1 and 52 weeks`,
      );
    }

    this.treatmentRecordRepository.merge(record, updateTreatmentRecordDto);
    return await this.treatmentRecordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const result = await this.treatmentRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment record with ID ${id} not found`);
    }
  }
}
