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
import { TreatmentSessionService } from './treatment-session.service';
import { TreatmentType } from '../entities/treatment-session.entity';
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
    private treatmentSessionService: TreatmentSessionService,
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
      const savedRecord = await this.treatmentRecordRepository.save(record);

      // Auto-create treatment sessions for lightbath/rod recommendations
      await this.createTreatmentSessionsFromRecord(savedRecord, attendance);

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

    // Track what lightbath/rod treatments were enabled before update
    const wasLightBathEnabled = record.light_bath;
    const wasRodEnabled = record.rod;

    this.treatmentRecordRepository.merge(record, updateTreatmentRecordDto);
    const updatedRecord = await this.treatmentRecordRepository.save(record);

    // Create treatment sessions for newly enabled treatments
    await this.handleNewlyEnabledTreatments(
      updatedRecord,
      wasLightBathEnabled,
      wasRodEnabled
    );

    return updatedRecord;
  }

  async remove(id: number): Promise<void> {
    const result = await this.treatmentRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment record with ID ${id} not found`);
    }
  }

  /**
   * Auto-create treatment sessions when lightbath or rod treatments are recommended
   */
  private async createTreatmentSessionsFromRecord(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<void> {
    try {
      // Create lightbath treatment session if recommended
      if (treatmentRecord.light_bath) {
        await this.createLightBathSession(treatmentRecord, attendance);
      }

      // Create rod treatment session if recommended
      if (treatmentRecord.rod) {
        await this.createRodSession(treatmentRecord, attendance);
      }
    } catch (error) {
      console.error(
        `Error creating treatment sessions for record ${treatmentRecord.id}:`,
        error
      );
      // Don't throw error to avoid breaking the treatment record creation
      // Log the error and continue
    }
  }

  /**
   * Handle newly enabled treatments during updates
   */
  private async handleNewlyEnabledTreatments(
    updatedRecord: TreatmentRecord,
    wasLightBathEnabled: boolean,
    wasRodEnabled: boolean
  ): Promise<void> {
    try {
      // Get the attendance for session creation
      const attendance = await this.attendanceRepository.findOne({
        where: { id: updatedRecord.attendance_id }
      });

      if (!attendance) {
        console.error(`Attendance ${updatedRecord.attendance_id} not found for treatment record ${updatedRecord.id}`);
        return;
      }

      // Create lightbath session if newly enabled
      if (updatedRecord.light_bath && !wasLightBathEnabled) {
        await this.createLightBathSession(updatedRecord, attendance);
      }

      // Create rod session if newly enabled
      if (updatedRecord.rod && !wasRodEnabled) {
        await this.createRodSession(updatedRecord, attendance);
      }
    } catch (error) {
      console.error(
        `Error creating treatment sessions for updated record ${updatedRecord.id}:`,
        error
      );
      // Don't throw error to avoid breaking the treatment record update
    }
  }

  /**
   * Create lightbath treatment session
   */
  private async createLightBathSession(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<void> {
    // Calculate start date (1 week from today for safety)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);

    // Determine body location
    const bodyLocation = treatmentRecord.location && treatmentRecord.location.length > 0 
      ? treatmentRecord.location[0] 
      : treatmentRecord.custom_location || 'Não especificado';

    // Default values for lightbath
    const defaultQuantity = treatmentRecord.quantity || 1;
    const defaultColor = treatmentRecord.light_bath_color || 'azul';
    const defaultDuration = 1; // 1 unit = 7 minutes

    const sessionDto = {
      treatment_record_id: treatmentRecord.id,
      attendance_id: attendance.id,
      patient_id: attendance.patient_id,
      treatment_type: TreatmentType.LIGHT_BATH,
      body_location: bodyLocation,
      start_date: startDate.toISOString().split('T')[0],
      planned_sessions: defaultQuantity,
      duration_minutes: defaultDuration,
      color: defaultColor,
      notes: `Sessão criada automaticamente a partir do registro de tratamento #${treatmentRecord.id}`,
    };

    await this.treatmentSessionService.createTreatmentSession(sessionDto);
  }

  /**
   * Create rod treatment session
   */
  private async createRodSession(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<void> {
    // Calculate start date (1 week from today for safety)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);

    // Determine body location
    const bodyLocation = treatmentRecord.location && treatmentRecord.location.length > 0 
      ? treatmentRecord.location[0] 
      : treatmentRecord.custom_location || 'Não especificado';

    // Default values for rod
    const defaultQuantity = treatmentRecord.quantity || 1;

    const sessionDto = {
      treatment_record_id: treatmentRecord.id,
      attendance_id: attendance.id,
      patient_id: attendance.patient_id,
      treatment_type: TreatmentType.ROD,
      body_location: bodyLocation,
      start_date: startDate.toISOString().split('T')[0],
      planned_sessions: defaultQuantity,
      notes: `Sessão criada automaticamente a partir do registro de tratamento #${treatmentRecord.id}`,
    };

    await this.treatmentSessionService.createTreatmentSession(sessionDto);
  }
}
