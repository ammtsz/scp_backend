import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceResponseDto,
} from '../dtos/attendance.dto';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { AttendanceStatus } from '../common/enums';
import {
  ResourceNotFoundException,
  InvalidAttendanceStatusTransitionException,
  AttendanceTimeSlotUnavailableException,
} from '../common/exceptions';
import { TreatmentSessionRecordService } from './treatment-session-record.service';
import { getCurrentDateString, getCurrentTimeString } from '../utils/datetime-helpers';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(ScheduleSetting)
    private scheduleSettingRepository: Repository<ScheduleSetting>,
    private treatmentSessionRecordService: TreatmentSessionRecordService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    await this.validateScheduling(createAttendanceDto);
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      relations: ['patient'],
    });
  }

  async findByDate(date: string): Promise<Attendance[]> {
    // Date is already in YYYY-MM-DD string format, use directly
    return await this.attendanceRepository.find({
      where: {
      scheduled_date: date,
      status: Not(AttendanceStatus.CANCELLED),
      },
      relations: ['patient'],
      order: {
      scheduled_time: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!attendance) {
      throw new ResourceNotFoundException('Attendance', id);
    }
    return attendance;
  }

  async findByPatientId(patientId: number): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendanceRepository.find({
      where: { patient_id: patientId },
      relations: ['patient'],
      order: {
        scheduled_date: 'DESC',
        scheduled_time: 'DESC',
      },
    });
    
    return attendances.map(attendance => this.transformToResponseDto(attendance));
  }

  private transformToResponseDto(attendance: Attendance): AttendanceResponseDto {
    return {
      id: attendance.id,
      patient_id: attendance.patient_id,
      type: attendance.type,
      status: attendance.status,
      scheduled_date: attendance.scheduled_date,
      scheduled_time: attendance.scheduled_time,
      checked_in_time: attendance.checked_in_time,
      started_time: attendance.started_time,
      completed_time: attendance.completed_time,
      cancelled_date: attendance.cancelled_date,
      absence_justified: attendance.absence_justified,
      absence_notes: attendance.absence_notes,
      notes: attendance.notes,
      created_at: `${attendance.created_date}T${attendance.created_time}`,
      updated_at: `${attendance.updated_date}T${attendance.updated_time}`,
      patient: attendance.patient,
    };
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    const attendance = await this.findOne(id);

    if (updateAttendanceDto.status) {
      await this.validateStatusTransition(
        attendance.status,
        updateAttendanceDto.status,
      );
    }

    // Always update the updated_date and updated_time
    const updateData: any = { 
      ...updateAttendanceDto,
      updated_date: getCurrentDateString(),
      updated_time: getCurrentTimeString()
    };

    // If status is being changed and corresponding time fields aren't provided,
    // set them automatically (status changes happen on scheduled_date, so we only need time)
    if (updateAttendanceDto.status && updateAttendanceDto.status !== attendance.status) {
      const currentTime = getCurrentTimeString();

      switch (updateAttendanceDto.status) {
        case AttendanceStatus.CHECKED_IN:
          if (!updateData.checked_in_time) updateData.checked_in_time = currentTime;
          break;
        case AttendanceStatus.IN_PROGRESS:
          if (!updateData.started_time) updateData.started_time = currentTime;
          break;
        case AttendanceStatus.COMPLETED:
          if (!updateData.completed_time) updateData.completed_time = currentTime;
          break;
        case AttendanceStatus.CANCELLED:
          // Cancellation might happen on a different date
          if (!updateData.cancelled_date) updateData.cancelled_date = getCurrentDateString();
          break;
        // For SCHEDULED status, we don't set any specific timestamp
      }
    }

    this.attendanceRepository.merge(attendance, updateData);
    const updatedAttendance = await this.attendanceRepository.save(attendance);

    // Check if this is a lightbath/rod attendance being completed
    if (
      updateAttendanceDto.status === AttendanceStatus.COMPLETED &&
      attendance.status !== AttendanceStatus.COMPLETED &&
      (attendance.type === 'light_bath' || attendance.type === 'rod')
    ) {
      await this.handleLightbathRodCompletion(updatedAttendance);
    }

    return updatedAttendance;
  }

  async remove(id: number, cancellationReason?: string): Promise<void> {
    // Try to find the attendance first to check status
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!attendance) {
      throw new ResourceNotFoundException('Attendance', id);
    }

    if (attendance.status === AttendanceStatus.COMPLETED) {
      throw new InvalidAttendanceStatusTransitionException(
        id,
        attendance.status,
        'CANCELLED',
      );
    }

    // Soft delete: Change status to cancelled instead of hard delete
    attendance.status = AttendanceStatus.CANCELLED;
    attendance.cancelled_date = new Date().toISOString().split('T')[0];
    attendance.cancelled_time = new Date().toTimeString().split(' ')[0].substring(0, 8);
    attendance.absence_justified = cancellationReason ? true : false;
    attendance.absence_notes = cancellationReason || 'Cancelado pelo sistema';
    
    await this.attendanceRepository.save(attendance);
  }

  async updateAbsenceJustifications(
    absenceJustifications: Array<{
      attendanceId: number;
      justified: boolean;
      justification?: string;
    }>
  ): Promise<void> {
    for (const absence of absenceJustifications) {
      const attendance = await this.attendanceRepository.findOne({
        where: { id: absence.attendanceId }
      });

      if (attendance) {
        attendance.status = AttendanceStatus.CANCELLED;
        attendance.cancelled_date = new Date().toISOString().split('T')[0];
        attendance.cancelled_time = new Date().toTimeString().split(' ')[0].substring(0, 8);
        attendance.absence_justified = absence.justified;
        attendance.absence_notes = absence.justification || null;
        
        await this.attendanceRepository.save(attendance);
      }
    }
  }

  private async validateScheduling(dto: CreateAttendanceDto): Promise<void> {
    // Parse date string to get day of week for validation
    const [year, month, day] = dto.scheduled_date.split('-').map(Number);
    const scheduledDate = new Date(year, month - 1, day); // month is 0-indexed
    const dayOfWeek = scheduledDate.getDay();

    const setting = await this.scheduleSettingRepository.findOne({
      where: {
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });

    if (!setting) {
      throw new ResourceNotFoundException(
        'scheduling settings',
        `day ${dayOfWeek}`,
      );
    }

    // Check if the time is within operational hours
    if (
      dto.scheduled_time < setting.start_time ||
      dto.scheduled_time > setting.end_time
    ) {
      throw new AttendanceTimeSlotUnavailableException(
        dto.scheduled_date,
        dto.scheduled_time,
        dto.type,
      );
    }

    // Check concurrent appointments using string date
    const concurrent = await this.attendanceRepository.count({
      where: {
        scheduled_date: dto.scheduled_date,
        scheduled_time: dto.scheduled_time,
        type: dto.type,
        status: AttendanceStatus.SCHEDULED,
      },
    });

    const maxConcurrent =
      dto.type === 'spiritual'
        ? setting.max_concurrent_spiritual
        : setting.max_concurrent_lightbath_rod;

    if (concurrent >= maxConcurrent) {
      throw new AttendanceTimeSlotUnavailableException(
        dto.scheduled_time,
        setting.start_time,
        setting.end_time,
      );
    }
  }

  private async validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): Promise<void> {
    const validTransitions: { [key: string]: string[] } = {
      [AttendanceStatus.SCHEDULED]: [
        AttendanceStatus.CHECKED_IN,
        AttendanceStatus.CANCELLED,
        AttendanceStatus.MISSED,
      ],
      [AttendanceStatus.CHECKED_IN]: [
        AttendanceStatus.SCHEDULED,
        AttendanceStatus.IN_PROGRESS,
        AttendanceStatus.COMPLETED,
        AttendanceStatus.CANCELLED,
      ],
      [AttendanceStatus.IN_PROGRESS]: [
        AttendanceStatus.CHECKED_IN,
        AttendanceStatus.COMPLETED,
        AttendanceStatus.CANCELLED,
      ],
      [AttendanceStatus.COMPLETED]: [
        AttendanceStatus.CHECKED_IN,
        AttendanceStatus.IN_PROGRESS,
      ],
      [AttendanceStatus.CANCELLED]: [
        AttendanceStatus.SCHEDULED,
      ],
      [AttendanceStatus.MISSED]: [
        AttendanceStatus.MISSED, // Allow updating missed attendance (e.g., to update absence notes)
        AttendanceStatus.SCHEDULED, // Allow rescheduling missed appointments
      ],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new InvalidAttendanceStatusTransitionException(
        0, // We don't have attendance ID here, it will be filled by the service
        currentStatus,
        newStatus,
      );
    }
  }

  // Get all attendances with minimal data for agenda view
  async findAllForAgenda(filters?: {
    status?: AttendanceStatus;
    type?: string;
    limit?: number;
  }): Promise<any[]> {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.patient_id',
        'attendance.type',
        'attendance.status',
        'attendance.scheduled_date',
        'attendance.notes',
        'patient.name',
        'patient.priority',
      ])
      .leftJoin('attendance.patient', 'patient');

    // Apply filters if provided
    if (filters?.status) {
      query.andWhere('attendance.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('attendance.type = :type', { type: filters.type });
    }

    query.orderBy('attendance.scheduled_date', 'ASC')
         .addOrderBy('attendance.scheduled_time', 'ASC');

    // Apply limit if provided
    if (filters?.limit && filters.limit > 0) {
      query.limit(filters.limit);
    }

    return await query.getRawMany();
  }

  // Get the next scheduled attendance date
  async findNextScheduledDate(): Promise<string | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      
      const nextAttendance = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .select('attendance.scheduled_date')
        .where('attendance.scheduled_date >= :today', { today })
        .andWhere('attendance.status != :cancelled', { cancelled: AttendanceStatus.CANCELLED })
        .orderBy('attendance.scheduled_date', 'ASC')
        .getOne();

      if (nextAttendance && nextAttendance.scheduled_date) {
        // scheduled_date is now always a string in YYYY-MM-DD format
        return nextAttendance.scheduled_date;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding next scheduled date:', error);
      throw error;
    }
  }

  // Bulk update attendance statuses
  async bulkUpdateStatus(ids: number[], status: AttendanceStatus): Promise<number> {
    try {
      const currentDate = getCurrentDateString();
      const currentTime = getCurrentTimeString();
      
      // Prepare the update object with status and updated timestamp
      const updateData: any = { 
        status,
        updated_date: currentDate,
        updated_time: currentTime,
      };

      // Add time fields based on the status (status changes happen on scheduled_date)
      switch (status) {
        case AttendanceStatus.CHECKED_IN:
          updateData.checked_in_time = currentTime;
          break;
        case AttendanceStatus.IN_PROGRESS:
          updateData.started_time = currentTime;
          break;
        case AttendanceStatus.COMPLETED:
          updateData.completed_time = currentTime;
          break;
        case AttendanceStatus.CANCELLED:
          // Cancellation might happen on a different date
          updateData.cancelled_date = currentDate;
          break;
        // For SCHEDULED status, we don't set any specific timestamp
      }

      const result = await this.attendanceRepository
        .createQueryBuilder()
        .update(Attendance)
        .set(updateData)
        .where('id IN (:...ids)', { ids })
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Error in bulk update:', error);
      throw error;
    }
  }

  // Get attendance statistics for a specific date
  async getAttendanceStats(date: string): Promise<{
    total: number;
    scheduled: number;
    checked_in: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    by_type: { spiritual: number; light_bath: number; rod: number };
  }> {
    // Use date string directly since scheduled_date is now a string
    const attendances = await this.attendanceRepository.find({
      where: { scheduled_date: date },
    });

    const stats = {
      total: attendances.length,
      scheduled: 0,
      checked_in: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      by_type: { spiritual: 0, light_bath: 0, rod: 0 },
    };

    attendances.forEach(attendance => {
      // Count by status
      switch (attendance.status) {
        case AttendanceStatus.SCHEDULED:
          stats.scheduled++;
          break;
        case AttendanceStatus.CHECKED_IN:
          stats.checked_in++;
          break;
        case AttendanceStatus.IN_PROGRESS:
          stats.in_progress++;
          break;
        case AttendanceStatus.COMPLETED:
          stats.completed++;
          break;
        case AttendanceStatus.CANCELLED:
          stats.cancelled++;
          break;
      }

      // Count by type
      if (attendance.type === 'spiritual') {
        stats.by_type.spiritual++;
      } else if (attendance.type === 'light_bath') {
        stats.by_type.light_bath++;
      } else if (attendance.type === 'rod') {
        stats.by_type.rod++;
      }
    });

    return stats;
  }

  /**
   * Handle completion of lightbath/rod attendances by creating treatment session records
   */
  private async handleLightbathRodCompletion(attendance: Attendance): Promise<void> {
    try {
      // Look for existing treatment sessions for this patient and treatment type
      const existingSession = await this.treatmentSessionRecordService.findActiveSessionForPatient(
        attendance.patient_id,
        attendance.type
      );

      if (existingSession) {
        // Create a new session record for this completed attendance
        await this.treatmentSessionRecordService.createRecordFromAttendance(
          existingSession.id,
          attendance
        );
      } else {
        // Log that no active treatment session was found
        console.warn(
          `No active treatment session found for patient ${attendance.patient_id} ` +
          `and type ${attendance.type}. Attendance ${attendance.id} completed but no session record created.`
        );
      }
    } catch (error) {
      // Log error but don't fail the attendance completion
      console.error(
        `Error creating treatment session record for attendance ${attendance.id}:`,
        error
      );
    }
  }
}
