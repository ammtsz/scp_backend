import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '../dtos/attendance.dto';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { AttendanceStatus } from '../common/enums';
import {
  ResourceNotFoundException,
  InvalidAttendanceStatusTransitionException,
  AttendanceTimeSlotUnavailableException,
} from '../common/exceptions';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(ScheduleSetting)
    private scheduleSettingRepository: Repository<ScheduleSetting>,
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
    // Convert YYYY-MM-DD string to Date object
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return await this.attendanceRepository.find({
      where: { scheduled_date: targetDate },
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

    this.attendanceRepository.merge(attendance, updateAttendanceDto);
    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
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
        'DELETED',
      );
    }

    const result = await this.attendanceRepository.delete(id);
    if (result.affected === 0) {
      throw new ResourceNotFoundException('Attendance', id);
    }
  }

  private async validateScheduling(dto: CreateAttendanceDto): Promise<void> {
    // Parse date string reliably to avoid timezone issues
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
        dto.scheduled_time,
        setting.start_time,
        setting.end_time,
      );
    }

    // Check concurrent appointments
    const concurrent = await this.attendanceRepository.count({
      where: {
        scheduled_date: scheduledDate,
        scheduled_time: dto.scheduled_time,
        type: dto.type,
        status: AttendanceStatus.SCHEDULED,
      },
    });

    const maxConcurrent =
      dto.type === 'spiritual'
        ? setting.max_concurrent_spiritual
        : setting.max_concurrent_light_bath;

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
      ],
      [AttendanceStatus.CHECKED_IN]: [
        AttendanceStatus.IN_PROGRESS,
        AttendanceStatus.CANCELLED,
      ],
      [AttendanceStatus.IN_PROGRESS]: [
        AttendanceStatus.COMPLETED,
        AttendanceStatus.CANCELLED,
      ],
      [AttendanceStatus.COMPLETED]: [],
      [AttendanceStatus.CANCELLED]: [],
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
        // Handle different date formats
        let dateString: string;
        if (nextAttendance.scheduled_date instanceof Date) {
          dateString = nextAttendance.scheduled_date.toISOString().split('T')[0];
        } else {
          // If it's already a string, format it properly
          dateString = new Date(nextAttendance.scheduled_date).toISOString().split('T')[0];
        }
        return dateString;
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
      const currentTime = new Date();
      
      // Prepare the update object with status and updated_at
      const updateData: any = { 
        status,
        updated_at: currentTime,
      };

      // Add timestamp field based on the status
      switch (status) {
        case AttendanceStatus.CHECKED_IN:
          updateData.checked_in_at = currentTime;
          break;
        case AttendanceStatus.IN_PROGRESS:
          updateData.started_at = currentTime;
          break;
        case AttendanceStatus.COMPLETED:
          updateData.completed_at = currentTime;
          break;
        case AttendanceStatus.CANCELLED:
          updateData.cancelled_at = currentTime;
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
    by_type: { spiritual: number; light_bath: number };
  }> {
    const targetDate = new Date(date);
    const attendances = await this.attendanceRepository.find({
      where: { scheduled_date: targetDate },
    });

    const stats = {
      total: attendances.length,
      scheduled: 0,
      checked_in: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      by_type: { spiritual: 0, light_bath: 0 },
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
      }
    });

    return stats;
  }
}
