import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentSessionRecord, SessionRecordStatus } from '../entities/treatment-session-record.entity';
import { TreatmentSession, SessionStatus } from '../entities/treatment-session.entity';
import { Attendance } from '../entities/attendance.entity';
import { 
  CreateTreatmentSessionRecordDto, 
  UpdateTreatmentSessionRecordDto,
  TreatmentSessionRecordResponseDto 
} from '../dtos/treatment-session-record.dto';

@Injectable()
export class TreatmentSessionRecordService {
  constructor(
    @InjectRepository(TreatmentSessionRecord)
    private sessionRecordRepository: Repository<TreatmentSessionRecord>,
    @InjectRepository(TreatmentSession)
    private treatmentSessionRepository: Repository<TreatmentSession>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  // ========================
  // CRUD OPERATIONS
  // ========================

  async createSessionRecord(dto: CreateTreatmentSessionRecordDto): Promise<TreatmentSessionRecordResponseDto> {
    // Validate that the treatment session exists
    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id: dto.treatment_session_id }
    });
    if (!treatmentSession) {
      throw new NotFoundException(`Treatment session with ID ${dto.treatment_session_id} not found`);
    }

    const sessionRecord = this.sessionRecordRepository.create({
      treatment_session_id: dto.treatment_session_id,
      session_number: dto.session_number,
      scheduled_date: dto.scheduled_date, // Already a string in YYYY-MM-DD format
      status: SessionRecordStatus.SCHEDULED,
      notes: dto.notes,
      performed_by: dto.performed_by,
      attendance_id: dto.attendance_id,
    });

    const saved = await this.sessionRecordRepository.save(sessionRecord);
    return this.toResponseDto(saved);
  }

  async getSessionRecordsBySession(sessionId: number): Promise<TreatmentSessionRecordResponseDto[]> {
    const records = await this.sessionRecordRepository.find({
      where: { treatment_session_id: sessionId },
      order: { session_number: 'ASC' },
    });

    return records.map(record => this.toResponseDto(record));
  }

  async getSessionRecordById(id: number): Promise<TreatmentSessionRecordResponseDto> {
    const record = await this.sessionRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }
    return this.toResponseDto(record);
  }

  async getAllSessionRecords(): Promise<TreatmentSessionRecordResponseDto[]> {
    const records = await this.sessionRecordRepository.find({
      relations: ['treatmentSession', 'attendance'],
      order: { created_date: 'DESC', created_time: 'DESC' },
    });

    return records.map(record => this.toResponseDto(record));
  }

  async updateSessionRecord(id: number, dto: UpdateTreatmentSessionRecordDto): Promise<TreatmentSessionRecordResponseDto> {
    const record = await this.sessionRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }

    // Update fields if provided
    if (dto.start_time !== undefined) record.start_time = dto.start_time;
    if (dto.end_time !== undefined) record.end_time = dto.end_time;
    if (dto.status !== undefined) record.status = dto.status;
    if (dto.notes !== undefined) record.notes = dto.notes;
    if (dto.missed_reason !== undefined) record.missed_reason = dto.missed_reason;
    if (dto.performed_by !== undefined) record.performed_by = dto.performed_by;
    if (dto.attendance_id !== undefined) record.attendance_id = dto.attendance_id;

    const updated = await this.sessionRecordRepository.save(record);
    return this.toResponseDto(updated);
  }

  async deleteSessionRecord(id: number): Promise<void> {
    const result = await this.sessionRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }
  }

  // ========================
  // BUSINESS LOGIC OPERATIONS
  // ========================

  async completeSession(id: number, attendanceId?: number, notes?: string): Promise<TreatmentSessionRecordResponseDto> {
    const record = await this.sessionRecordRepository.findOne({ 
      where: { id },
      relations: ['treatmentSession'],
    });
    
    if (!record) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }

    // Validate attendance if provided
    if (attendanceId) {
      const attendance = await this.attendanceRepository.findOne({ where: { id: attendanceId } });
      if (!attendance) {
        throw new NotFoundException(`Attendance with ID ${attendanceId} not found`);
      }
      record.attendance_id = attendanceId;
    }

    record.status = SessionRecordStatus.COMPLETED;
    
    // Set start_time if not already set
    if (!record.start_time) {
      record.start_time = new Date().toTimeString().split(' ')[0].substring(0, 8); // HH:MM:SS format
    }
    
    // Set end_time for completion
    record.end_time = new Date().toTimeString().split(' ')[0].substring(0, 8); // HH:MM:SS format
    
    if (notes) record.notes = notes;

    const updated = await this.sessionRecordRepository.save(record);

    // Update the treatment session's completed count
    await this.updateTreatmentSessionProgress(record.treatment_session_id);

    return this.toResponseDto(updated);
  }

  async markSessionMissed(id: number, reason: string): Promise<TreatmentSessionRecordResponseDto> {
    const record = await this.sessionRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }

    record.status = SessionRecordStatus.MISSED;
    record.missed_reason = reason;

    const updated = await this.sessionRecordRepository.save(record);
    return this.toResponseDto(updated);
  }

  async rescheduleSession(id: number, newDate: string): Promise<TreatmentSessionRecordResponseDto> {
    const record = await this.sessionRecordRepository.findOne({ 
      where: { id },
      relations: ['treatmentSession'],
    });
    
    if (!record) {
      throw new NotFoundException(`Session record with ID ${id} not found`);
    }

    record.scheduled_date = newDate; // newDate should already be in YYYY-MM-DD format
    record.status = SessionRecordStatus.SCHEDULED;
    
    const updated = await this.sessionRecordRepository.save(record);
    return this.toResponseDto(updated);
  }

  // ========================
  // ANALYTICS METHODS
  // ========================

  async getUpcomingSessionsForPatient(patientId: number, days: number = 7): Promise<TreatmentSessionRecordResponseDto[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const records = await this.sessionRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.treatmentSession', 'session')
      .where('session.patient_id = :patientId', { patientId })
      .andWhere('record.status = :status', { status: SessionRecordStatus.SCHEDULED })
      .andWhere('record.scheduled_date BETWEEN :now AND :future', { 
        now: new Date(), 
        future: futureDate 
      })
      .orderBy('record.scheduled_date', 'ASC')
      .getMany();

    return records.map(record => this.toResponseDto(record));
  }

  // ========================
  // PRIVATE HELPER METHODS
  // ========================

  private async updateTreatmentSessionProgress(sessionId: number): Promise<void> {
    const completedCount = await this.sessionRecordRepository.count({
      where: { 
        treatment_session_id: sessionId,
        status: SessionRecordStatus.COMPLETED 
      }
    });

    await this.treatmentSessionRepository.update(sessionId, {
      completed_sessions: completedCount
    });
  }

  /**
   * Find active treatment session for a patient and treatment type
   */
  async findActiveSessionForPatient(patientId: number, treatmentType: string): Promise<TreatmentSession | null> {
    return this.treatmentSessionRepository.findOne({
      where: {
        patient_id: patientId,
        treatment_type: treatmentType as any,
        status: SessionStatus.IN_PROGRESS
      }
    });
  }

  /**
   * Create a treatment session record from a completed attendance
   */
  async createRecordFromAttendance(treatmentSessionId: number, attendance: Attendance): Promise<TreatmentSessionRecordResponseDto> {
    // Find the next session number for this treatment session
    const existingRecords = await this.sessionRecordRepository.find({
      where: { treatment_session_id: treatmentSessionId },
      order: { session_number: 'DESC' }
    });

    const nextSessionNumber = existingRecords.length > 0 ? existingRecords[0].session_number + 1 : 1;

    // Create the session record
    const sessionRecord = this.sessionRecordRepository.create({
      treatment_session_id: treatmentSessionId,
      attendance_id: attendance.id,
      session_number: nextSessionNumber,
      scheduled_date: attendance.scheduled_date,
      start_time: null, // Will be set separately if needed
      end_time: null, // Will be set separately if needed
      status: SessionRecordStatus.COMPLETED,
      notes: `Sessão completada automaticamente via atendimento #${attendance.id}`,
      performed_by: 'Sistema', // Could be enhanced to track actual user
    });

    const saved = await this.sessionRecordRepository.save(sessionRecord);
    
    // Update the treatment session's completed session count
    await this.treatmentSessionRepository.update(treatmentSessionId, {
      completed_sessions: nextSessionNumber
    });
    
    return this.toResponseDto(saved);
  }

  private toResponseDto(record: TreatmentSessionRecord): TreatmentSessionRecordResponseDto {
    return {
      id: record.id,
      treatment_session_id: record.treatment_session_id,
      attendance_id: record.attendance_id,
      session_number: record.session_number,
      scheduled_date: record.scheduled_date,
      start_time: record.start_time,
      end_time: record.end_time,
      status: record.status,
      notes: record.notes,
      missed_reason: record.missed_reason,
      performed_by: record.performed_by,
      created_date: record.created_date,
      created_time: record.created_time,
      updated_date: record.updated_date,
      updated_time: record.updated_time,
    };
  }
}
