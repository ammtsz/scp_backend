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
    private treatmentSessionService: TreatmentSessionService,
    private attendanceService: AttendanceService,
  ) {}

  async create(
    createTreatmentRecordDto: CreateTreatmentRecordDto,
  ): Promise<{
    record: TreatmentRecord;
    treatmentSessions?: {
      lightBathResult?: { success: boolean; errors: string[] };
      rodResult?: { success: boolean; errors: string[] };
    };
  }> {
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
      const treatmentResults = await this.createTreatmentSessionsFromRecord(savedRecord, attendance);

      // Return both the record and any treatment session creation results
      const result: any = { record: savedRecord };
      if (Object.keys(treatmentResults).length > 0) {
        result.treatmentSessions = treatmentResults;
      }

      return result;
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

  async update(id: number, updateData: UpdateTreatmentRecordDto): Promise<{
    record: TreatmentRecord;
    treatmentSessions?: {
      lightBathResult?: { success: boolean; errors: string[] };
      rodResult?: { success: boolean; errors: string[] };
    };
  }> {
    // Get existing record to check current state
    const existingRecord = await this.findOne(id);
    const wasLightBathEnabled = existingRecord.light_bath;
    const wasRodEnabled = existingRecord.rod;

    // Update the treatment record
    await this.treatmentRecordRepository.update(id, updateData);
    const updatedRecord = await this.findOne(id);

    // Handle newly enabled treatments
    const treatmentResults = await this.handleNewlyEnabledTreatments(
      updatedRecord,
      wasLightBathEnabled,
      wasRodEnabled
    );

    // Return both the record and any treatment session creation results
    const result: any = { record: updatedRecord };
    if (Object.keys(treatmentResults).length > 0) {
      result.treatmentSessions = treatmentResults;
    }

    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.treatmentRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment record with ID ${id} not found`);
    }
  }

  /**
   * Auto-create treatment sessions when lightbath or rod treatments are recommended
   * NOTE: This is now handled by the frontend via the treatment-sessions API,
   * so we disable automatic session creation to prevent duplicates and incorrect defaults.
   */
  private async createTreatmentSessionsFromRecord(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<{ lightBathResult?: { success: boolean; errors: string[] }; rodResult?: { success: boolean; errors: string[] } }> {
    // Automatic session creation is disabled - frontend handles this via API
    return {};
  }

  /**
   * Handle newly enabled treatments during updates
   */
  private async handleNewlyEnabledTreatments(
    updatedRecord: TreatmentRecord,
    wasLightBathEnabled: boolean,
    wasRodEnabled: boolean
  ): Promise<{ lightBathResult?: { success: boolean; errors: string[] }; rodResult?: { success: boolean; errors: string[] } }> {
    const results: any = {};

    try {
      // Get the attendance for session creation
      const attendance = await this.attendanceRepository.findOne({
        where: { id: updatedRecord.attendance_id }
      });

      if (!attendance) {
        console.error(`Attendance ${updatedRecord.attendance_id} not found for treatment record ${updatedRecord.id}`);
        return results;
      }

      // Create lightbath session if newly enabled
      if (updatedRecord.light_bath && !wasLightBathEnabled) {
        results.lightBathResult = await this.createLightBathSession(updatedRecord, attendance);
      }

      // Create rod session if newly enabled
      if (updatedRecord.rod && !wasRodEnabled) {
        results.rodResult = await this.createRodSession(updatedRecord, attendance);
      }

      return results;
    } catch (error) {
      console.error(
        `Error creating treatment sessions for updated record ${updatedRecord.id}:`,
        error
      );
      // Return the partial results even if there was a general error
      return results;
    }
  }

  /**
   * Create lightbath treatment session and corresponding attendances
   */
  private async createLightBathSession(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<{ success: boolean; errors: string[] }> {
    const allErrors: string[] = [];

    try {
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

      // Create the treatment session
      const createdSession = await this.treatmentSessionService.createTreatmentSession(sessionDto);

      // Create individual attendances for each planned session
      const attendanceResult = await this.createAttendancesForTreatmentSessions(
        attendance.patient_id,
        AttendanceType.LIGHT_BATH,
        startDate,
        defaultQuantity,
        `${bodyLocation} - Banho de Luz ${defaultColor}`
      );

      allErrors.push(...attendanceResult.errors);

      return { 
        success: attendanceResult.errors.length === 0, 
        errors: allErrors 
      };
    } catch (error) {
      const errorMessage = `Erro ao criar sessão de banho de luz: ${error.message || error}`;
      allErrors.push(errorMessage);
      console.error(errorMessage, error);
      return { success: false, errors: allErrors };
    }
  }

  /**
   * Create rod treatment session and corresponding attendances
   */
  private async createRodSession(
    treatmentRecord: TreatmentRecord,
    attendance: Attendance
  ): Promise<{ success: boolean; errors: string[] }> {
    const allErrors: string[] = [];

    try {
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

      // Create the treatment session
      const createdSession = await this.treatmentSessionService.createTreatmentSession(sessionDto);

      // Create individual attendances for each planned session
      const attendanceResult = await this.createAttendancesForTreatmentSessions(
        attendance.patient_id,
        AttendanceType.ROD,
        startDate,
        defaultQuantity,
        `${bodyLocation} - Bastão`
      );

      allErrors.push(...attendanceResult.errors);

      return { 
        success: attendanceResult.errors.length === 0, 
        errors: allErrors 
      };
    } catch (error) {
      const errorMessage = `Erro ao criar sessão com bastão: ${error.message || error}`;
      allErrors.push(errorMessage);
      console.error(errorMessage, error);
      return { success: false, errors: allErrors };
    }
  }

  /**
   * Create individual attendances for treatment sessions (scheduled on Tuesdays)
   */
  private async createAttendancesForTreatmentSessions(
    patientId: number,
    attendanceType: AttendanceType,
    startDate: Date,
    sessionCount: number,
    notes: string
  ): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    try {
      // Find the next Tuesday from start date
      let currentDate = new Date(startDate);
      currentDate = this.getNextTuesday(currentDate);

      for (let i = 0; i < sessionCount; i++) {
        const sessionNumber = i + 1;
        
        try {
          await this.attendanceService.create({
            patient_id: patientId,
            type: attendanceType,
            scheduled_date: currentDate.toISOString().split('T')[0],
            scheduled_time: '21:00', // Default evening time for treatments (9 PM)
            notes: `${notes} - Sessão ${sessionNumber} de ${sessionCount}`,
          });
          successCount++;
        } catch (error) {
          const errorMessage = `Erro ao criar agendamento ${sessionNumber}/${sessionCount} para ${currentDate.toDateString()}: ${error.message || error}`;
          errors.push(errorMessage);
          console.error(errorMessage, error);
        }

        // Move to next Tuesday (7 days later)
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } catch (error) {
      const generalError = `Erro geral ao criar agendamentos: ${error.message || error}`;
      errors.push(generalError);
      console.error(generalError, error);
    }

    return { success: successCount, errors };
  }

  /**
   * Get the next Tuesday from the given date (or the same date if it's already Tuesday)
   */
  private getNextTuesday(date: Date): Date {
    const result = new Date(date);
    const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 2 = Tuesday
    
    if (dayOfWeek === 2) {
      // It's already Tuesday
      return result;
    }
    
    // Calculate days until next Tuesday
    let daysToAdd;
    if (dayOfWeek < 2) {
      // Sunday (0) or Monday (1) -> add days to reach Tuesday
      daysToAdd = 2 - dayOfWeek;
    } else {
      // Wednesday (3), Thursday (4), Friday (5), Saturday (6) -> add days to reach next Tuesday
      daysToAdd = 7 - dayOfWeek + 2;
    }
    
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }
}
