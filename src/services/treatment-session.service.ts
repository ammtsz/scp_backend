import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentSession, SessionStatus, TreatmentType } from '../entities/treatment-session.entity';
import { TreatmentSessionRecord, SessionRecordStatus } from '../entities/treatment-session-record.entity';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { Patient } from '../entities/patient.entity';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { 
  CreateTreatmentSessionDto, 
  UpdateTreatmentSessionDto, 
  TreatmentSessionResponseDto 
} from '../dtos/treatment-session.dto';
import { 
  formatDateToString, 
  addDaysToDateString, 
  getNextTuesdayString 
} from '../utils/date-string-helpers';

@Injectable()
export class TreatmentSessionService {
  constructor(
    @InjectRepository(TreatmentSession)
    private treatmentSessionRepository: Repository<TreatmentSession>,
    @InjectRepository(TreatmentSessionRecord)
    private treatmentSessionRecordRepository: Repository<TreatmentSessionRecord>,
    @InjectRepository(TreatmentRecord)
    private treatmentRecordRepository: Repository<TreatmentRecord>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  // ========================
  // TREATMENT SESSION METHODS
  // ========================

  async createTreatmentSession(dto: CreateTreatmentSessionDto): Promise<TreatmentSessionResponseDto> {
    // Validate that the treatment_record exists
    const treatmentRecord = await this.treatmentRecordRepository.findOne({
      where: { id: dto.treatment_record_id }
    });
    if (!treatmentRecord) {
      throw new NotFoundException(`Treatment record with ID ${dto.treatment_record_id} not found`);
    }

    // Validate that the attendance exists
    const attendance = await this.attendanceRepository.findOne({
      where: { id: dto.attendance_id }
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${dto.attendance_id} not found`);
    }

    // Validate light bath requirements
    if (dto.treatment_type === TreatmentType.LIGHT_BATH) {
      if (!dto.duration_minutes || !dto.color) {
        throw new BadRequestException('Light bath treatments require duration_minutes and color');
      }
    }

    // Use timezone-agnostic string dates
    const treatmentSession = this.treatmentSessionRepository.create({
      treatment_record_id: dto.treatment_record_id,
      attendance_id: dto.attendance_id,
      patient_id: dto.patient_id,
      treatment_type: dto.treatment_type,
      body_location: dto.body_location,
      start_date: dto.start_date,
      planned_sessions: dto.planned_sessions,
      completed_sessions: 0,
      end_date: dto.end_date || null,
      status: SessionStatus.SCHEDULED,
      duration_minutes: dto.duration_minutes,
      color: dto.color,
      notes: dto.notes,
    });

    const saved = await this.treatmentSessionRepository.save(treatmentSession);

    // Automatically create session records for planned sessions
    if (dto.planned_sessions > 0) {
      await this.createSessionRecordsForTreatment(saved.id, dto.planned_sessions, dto.start_date);
    }

    return this.toResponseDto(saved);
  }

  async getTreatmentSessionsByPatient(patientId: number): Promise<TreatmentSessionResponseDto[]> {
    const sessions = await this.treatmentSessionRepository.find({
      where: { patient_id: patientId },
      relations: ['sessionRecords', 'treatmentRecord', 'attendance'],
      order: { created_date: 'DESC', created_time: 'DESC' },
    });

    return sessions.map(session => this.toResponseDto(session));
  }

  async getTreatmentSessionsByTreatmentRecord(treatmentRecordId: number): Promise<TreatmentSessionResponseDto[]> {
    const sessions = await this.treatmentSessionRepository.find({
      where: { treatment_record_id: treatmentRecordId },
      relations: ['sessionRecords', 'treatmentRecord', 'attendance'],
      order: { created_date: 'ASC', created_time: 'ASC' },
    });

    return sessions.map(session => this.toResponseDto(session));
  }

  async getTreatmentSessionsByDate(date: string): Promise<TreatmentSessionResponseDto[]> {
    // Use string date directly for timezone-agnostic comparison
    const sessions = await this.treatmentSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.sessionRecords', 'records')
      .leftJoinAndSelect('session.treatmentRecord', 'treatmentRecord')
      .leftJoinAndSelect('session.attendance', 'attendance')
      .leftJoinAndSelect('attendance.patient', 'patient')
      .where('session.start_date = :date', { date })
      .orWhere('records.scheduled_date = :date', { date })
      .orderBy('session.created_date', 'ASC')
      .addOrderBy('session.created_time', 'ASC')
      .getMany();

    return sessions.map(session => this.toResponseDto(session));
  }

  async getTreatmentSessionById(id: number): Promise<TreatmentSessionResponseDto> {
    const session = await this.treatmentSessionRepository.findOne({
      where: { id },
      relations: ['sessionRecords', 'treatmentRecord', 'attendance'],
    });

    if (!session) {
      throw new NotFoundException(`Treatment session with ID ${id} not found`);
    }

    return this.toResponseDto(session);
  }

  async updateTreatmentSession(id: number, dto: UpdateTreatmentSessionDto): Promise<TreatmentSessionResponseDto> {
    const session = await this.treatmentSessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Treatment session with ID ${id} not found`);
    }

    // Update fields if provided
    if (dto.completed_sessions !== undefined) session.completed_sessions = dto.completed_sessions;
    if (dto.end_date !== undefined) session.end_date = dto.end_date;
    if (dto.notes !== undefined) session.notes = dto.notes;

    // Auto-complete if all sessions are done
    if (session.completed_sessions >= session.planned_sessions) {
      session.status = SessionStatus.COMPLETED;
      if (!session.end_date) {
        session.end_date = formatDateToString(new Date());
      }
    }

    const updated = await this.treatmentSessionRepository.save(session);
    return this.toResponseDto(updated);
  }

  async deleteTreatmentSession(id: number): Promise<void> {
    // First, find the treatment session to ensure it exists
    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id },
      relations: ['sessionRecords']
    });

    if (!treatmentSession) {
      throw new NotFoundException(`Treatment session with ID ${id} not found`);
    }

    // Delete all related attendances created for this treatment session
    if (treatmentSession.sessionRecords && treatmentSession.sessionRecords.length > 0) {
      const attendanceIds = treatmentSession.sessionRecords
        .filter(record => record.attendance_id)
        .map(record => record.attendance_id);

      if (attendanceIds.length > 0) {
        await this.attendanceRepository.delete(attendanceIds);
        console.log(`🗑️ Deleted ${attendanceIds.length} related attendances for treatment session ${id}`);
      }
    }

    // Delete the treatment session (session records will be cascade deleted)
    const result = await this.treatmentSessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment session with ID ${id} not found`);
    }

    console.log(`✅ Successfully deleted treatment session ${id} and all related records`);
  }

  async getAllTreatmentSessions(): Promise<TreatmentSessionResponseDto[]> {
    const sessions = await this.treatmentSessionRepository.find({
      relations: ['sessionRecords', 'treatmentRecord', 'attendance'],
      order: { created_date: 'DESC', created_time: 'DESC' },
    });

    return sessions.map(session => this.toResponseDto(session));
  }

  // ===================
  // ANALYTICS METHODS
  // ===================

  async getTreatmentStats(patientId: number): Promise<any> {
    const sessions = await this.treatmentSessionRepository.find({
      where: { patient_id: patientId },
      relations: ['sessionRecords'],
    });

    const totalSessions = sessions.reduce((sum, session) => sum + session.planned_sessions, 0);
    const completedSessions = sessions.reduce((sum, session) => sum + session.completed_sessions, 0);
    
    const allRecords = sessions.flatMap(session => session.sessionRecords || []);
    const missedSessions = allRecords.filter(record => record.status === SessionRecordStatus.MISSED).length;
    const scheduledSessions = allRecords.filter(record => record.status === SessionRecordStatus.SCHEDULED).length;

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      completedSessions,
      missedSessions,
      scheduledSessions,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  // ========================
  // PRIVATE HELPER METHODS
  // ========================

  private async createSessionRecordsForTreatment(sessionId: number, plannedSessions: number, startDate: string): Promise<void> {
    // Get the treatment session to access patient_id and treatment_type
    const treatmentSession = await this.treatmentSessionRepository.findOne({
      where: { id: sessionId }
    });
    
    if (!treatmentSession) {
      throw new NotFoundException(`Treatment session with ID ${sessionId} not found`);
    }
    
    const records = [];
    // Use timezone-agnostic string date approach
    let currentDateStr = startDate;

    for (let i = 1; i <= plannedSessions; i++) {
      const record = this.treatmentSessionRecordRepository.create({
        treatment_session_id: sessionId,
        session_number: i,
        scheduled_date: currentDateStr,
        status: SessionRecordStatus.SCHEDULED,
      });
      
      records.push(record);

      // Add 7 days for weekly sessions (this could be configurable)
      currentDateStr = addDaysToDateString(currentDateStr, 7);
    }

    const savedRecords = await this.treatmentSessionRecordRepository.save(records);

    // Create attendances for each session record
    const attendanceType = treatmentSession.treatment_type === TreatmentType.LIGHT_BATH ? AttendanceType.LIGHT_BATH : AttendanceType.ROD;
    
    for (const record of savedRecords) {
      const attendance = this.attendanceRepository.create({
        patient_id: treatmentSession.patient_id,
        type: attendanceType,
        scheduled_date: record.scheduled_date,
        scheduled_time: '19:30', // Default time for treatment sessions
        status: AttendanceStatus.SCHEDULED,
        notes: `Sessão ${record.session_number} de ${plannedSessions} - ${treatmentSession.body_location}`,
      });
      
      const savedAttendance = await this.attendanceRepository.save(attendance);
      
      // Link the attendance to the session record
      record.attendance_id = savedAttendance.id;
      await this.treatmentSessionRecordRepository.save(record);
    }
  }

  private toResponseDto(session: TreatmentSession): TreatmentSessionResponseDto {
    return {
      id: session.id,
      treatment_record_id: session.treatment_record_id,
      attendance_id: session.attendance_id,
      patient_id: session.patient_id,
      treatment_type: session.treatment_type,
      body_location: session.body_location,
      start_date: session.start_date,
      planned_sessions: session.planned_sessions,
      completed_sessions: session.completed_sessions,
      end_date: session.end_date,
      status: session.status,
      duration_minutes: session.duration_minutes,
      color: session.color,
      notes: session.notes,
      sessionRecords: session.sessionRecords,
      created_date: session.created_date,
      created_time: session.created_time,
      updated_date: session.updated_date,
      updated_time: session.updated_time,
    };
  }
}
