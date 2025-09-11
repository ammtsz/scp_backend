import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentSessionRecordController } from './treatment-session-record.controller';
import { TreatmentSessionRecordService } from '../services/treatment-session-record.service';
import {
  CreateTreatmentSessionRecordDto,
  UpdateTreatmentSessionRecordDto,
  TreatmentSessionRecordResponseDto,
} from '../dtos/treatment-session-record.dto';
import { SessionRecordStatus } from '../entities/treatment-session-record.entity';

describe('TreatmentSessionRecordController', () => {
  let controller: TreatmentSessionRecordController;
  let service: TreatmentSessionRecordService;

  const mockTreatmentSessionRecordService = {
    createSessionRecord: jest.fn(),
    getSessionRecordById: jest.fn(),
    getSessionRecordsBySession: jest.fn(),
    updateSessionRecord: jest.fn(),
    deleteSessionRecord: jest.fn(),
    completeSession: jest.fn(),
    markSessionMissed: jest.fn(),
    rescheduleSession: jest.fn(),
    getUpcomingSessionsForPatient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentSessionRecordController],
      providers: [
        {
          provide: TreatmentSessionRecordService,
          useValue: mockTreatmentSessionRecordService,
        },
      ],
    }).compile();

    controller = module.get<TreatmentSessionRecordController>(TreatmentSessionRecordController);
    service = module.get<TreatmentSessionRecordService>(TreatmentSessionRecordService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('CRUD Operations', () => {
    describe('createSessionRecord', () => {
      it('should create a treatment session record', async () => {
        const dto: CreateTreatmentSessionRecordDto = {
          treatment_session_id: 1,
          session_number: 1,
          scheduled_date: '2024-01-01',
          notes: 'First session',
        };

        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: undefined,
          session_number: 1,
          scheduled_date: new Date('2024-01-01'),
          start_time: undefined,
          end_time: undefined,
          status: SessionRecordStatus.SCHEDULED,
          notes: 'First session',
          missed_reason: undefined,
          performed_by: undefined,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.createSessionRecord.mockResolvedValue(expected);

        const result = await controller.createSessionRecord(dto);

        expect(service.createSessionRecord).toHaveBeenCalledWith(dto);
        expect(result).toEqual(expected);
      });
    });

    describe('getSessionRecordById', () => {
      it('should get treatment session record by ID', async () => {
        const recordId = 1;
        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: 1,
          session_number: 1,
          scheduled_date: new Date('2024-01-01'),
          start_time: new Date('2024-01-01T10:00:00Z'),
          end_time: new Date('2024-01-01T10:30:00Z'),
          status: SessionRecordStatus.COMPLETED,
          notes: 'Session completed successfully',
          missed_reason: undefined,
          performed_by: 'Dr. Smith',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.getSessionRecordById.mockResolvedValue(expected);

        const result = await controller.getSessionRecordById(recordId);

        expect(service.getSessionRecordById).toHaveBeenCalledWith(recordId);
        expect(result).toEqual(expected);
      });
    });

    describe('getSessionRecordsBySession', () => {
      it('should get treatment session records by treatment session', async () => {
        const treatmentSessionId = 1;
        const expected: TreatmentSessionRecordResponseDto[] = [
          {
            id: 1,
            treatment_session_id: 1,
            attendance_id: 1,
            session_number: 1,
            scheduled_date: new Date('2024-01-01'),
            start_time: new Date('2024-01-01T10:00:00Z'),
            end_time: new Date('2024-01-01T10:30:00Z'),
            status: SessionRecordStatus.COMPLETED,
            notes: 'Session completed',
            missed_reason: undefined,
            performed_by: 'Dr. Smith',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        mockTreatmentSessionRecordService.getSessionRecordsBySession.mockResolvedValue(expected);

        const result = await controller.getSessionRecordsBySession(treatmentSessionId);

        expect(service.getSessionRecordsBySession).toHaveBeenCalledWith(treatmentSessionId);
        expect(result).toEqual(expected);
      });
    });

    describe('updateSessionRecord', () => {
      it('should update a treatment session record', async () => {
        const recordId = 1;
        const dto: UpdateTreatmentSessionRecordDto = {
          notes: 'Updated session notes',
        };

        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: 1,
          session_number: 1,
          scheduled_date: new Date('2024-01-01'),
          start_time: new Date('2024-01-01T10:00:00Z'),
          end_time: new Date('2024-01-01T10:30:00Z'),
          status: SessionRecordStatus.COMPLETED,
          notes: 'Updated session notes',
          missed_reason: undefined,
          performed_by: 'Dr. Smith',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.updateSessionRecord.mockResolvedValue(expected);

        const result = await controller.updateSessionRecord(recordId, dto);

        expect(service.updateSessionRecord).toHaveBeenCalledWith(recordId, dto);
        expect(result).toEqual(expected);
      });
    });

    describe('deleteSessionRecord', () => {
      it('should delete a treatment session record', async () => {
        const recordId = 1;

        mockTreatmentSessionRecordService.deleteSessionRecord.mockResolvedValue(undefined);

        await controller.deleteSessionRecord(recordId);

        expect(service.deleteSessionRecord).toHaveBeenCalledWith(recordId);
      });
    });
  });

  describe('Business Logic Operations', () => {
    describe('completeSession', () => {
      it('should complete a session', async () => {
        const recordId = 1;
        const completeDto = {
          attendanceId: 1,
          notes: 'Session completed successfully',
        };

        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: 1,
          session_number: 1,
          scheduled_date: new Date('2024-01-01'),
          start_time: new Date(),
          end_time: new Date(),
          status: SessionRecordStatus.COMPLETED,
          notes: 'Session completed successfully',
          missed_reason: undefined,
          performed_by: 'Dr. Smith',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.completeSession.mockResolvedValue(expected);

        const result = await controller.completeSession(recordId, completeDto);

        expect(service.completeSession).toHaveBeenCalledWith(recordId, completeDto.attendanceId, completeDto.notes);
        expect(result).toEqual(expected);
      });
    });

    describe('markSessionMissed', () => {
      it('should mark a session as missed', async () => {
        const recordId = 1;
        const missedDto = {
          reason: 'Patient did not show up',
        };

        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: undefined,
          session_number: 1,
          scheduled_date: new Date('2024-01-01'),
          start_time: undefined,
          end_time: undefined,
          status: SessionRecordStatus.MISSED,
          notes: undefined,
          missed_reason: 'Patient did not show up',
          performed_by: undefined,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.markSessionMissed.mockResolvedValue(expected);

        const result = await controller.markSessionMissed(recordId, missedDto);

        expect(service.markSessionMissed).toHaveBeenCalledWith(recordId, missedDto.reason);
        expect(result).toEqual(expected);
      });
    });

    describe('rescheduleSession', () => {
      it('should reschedule a session', async () => {
        const recordId = 1;
        const rescheduleDto = {
          newDate: '2024-01-02',
        };

        const expected: TreatmentSessionRecordResponseDto = {
          id: 1,
          treatment_session_id: 1,
          attendance_id: undefined,
          session_number: 1,
          scheduled_date: new Date('2024-01-02'),
          start_time: undefined,
          end_time: undefined,
          status: SessionRecordStatus.SCHEDULED,
          notes: undefined,
          missed_reason: undefined,
          performed_by: undefined,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionRecordService.rescheduleSession.mockResolvedValue(expected);

        const result = await controller.rescheduleSession(recordId, rescheduleDto);

        expect(service.rescheduleSession).toHaveBeenCalledWith(recordId, rescheduleDto.newDate);
        expect(result).toEqual(expected);
      });
    });

    describe('getUpcomingSessionsForPatient', () => {
      it('should get upcoming sessions for a patient', async () => {
        const patientId = 1;
        const days = 7;
        const expected: TreatmentSessionRecordResponseDto[] = [
          {
            id: 2,
            treatment_session_id: 1,
            attendance_id: undefined,
            session_number: 2,
            scheduled_date: new Date('2024-01-02'),
            start_time: undefined,
            end_time: undefined,
            status: SessionRecordStatus.SCHEDULED,
            notes: 'Next session',
            missed_reason: undefined,
            performed_by: undefined,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        mockTreatmentSessionRecordService.getUpcomingSessionsForPatient.mockResolvedValue(expected);

        const result = await controller.getUpcomingSessionsForPatient(patientId, days);

        expect(service.getUpcomingSessionsForPatient).toHaveBeenCalledWith(patientId, days);
        expect(result).toEqual(expected);
      });
    });
  });
});
