import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentSessionController } from './treatment-session.controller';
import { TreatmentSessionService } from '../services/treatment-session.service';
import {
  CreateTreatmentSessionDto,
  UpdateTreatmentSessionDto,
  TreatmentSessionResponseDto,
} from '../dtos/treatment-session.dto';

describe('TreatmentSessionController', () => {
  let controller: TreatmentSessionController;
  let service: TreatmentSessionService;

  const mockTreatmentSessionService = {
    createTreatmentSession: jest.fn(),
    getTreatmentSessionsByPatient: jest.fn(),
    getTreatmentSessionsByTreatmentRecord: jest.fn(),
    getTreatmentSessionById: jest.fn(),
    updateTreatmentSession: jest.fn(),
    deleteTreatmentSession: jest.fn(),
    getTreatmentStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentSessionController],
      providers: [
        {
          provide: TreatmentSessionService,
          useValue: mockTreatmentSessionService,
        },
      ],
    }).compile();

    controller = module.get<TreatmentSessionController>(TreatmentSessionController);
    service = module.get<TreatmentSessionService>(TreatmentSessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Treatment Session Endpoints', () => {
    describe('createTreatmentSession', () => {
      it('should create a treatment session', async () => {
        const dto: CreateTreatmentSessionDto = {
          treatment_record_id: 1,
          attendance_id: 1,
          patient_id: 1,
          treatment_type: 'light_bath' as any,
          body_location: 'head',
          start_date: '2024-01-01',
          planned_sessions: 10,
          duration_minutes: 30,
          color: 'blue',
          notes: 'Test treatment',
        };

        const expected: TreatmentSessionResponseDto = {
          id: 1,
          treatment_record_id: 1,
          attendance_id: 1,
          patient_id: 1,
          treatment_type: 'light_bath' as any,
          body_location: 'head',
          start_date: new Date('2024-01-01'),
          planned_sessions: 10,
          completed_sessions: 0,
          end_date: null,
          status: 'scheduled',
          duration_minutes: 30,
          color: 'blue',
          notes: 'Test treatment',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionService.createTreatmentSession.mockResolvedValue(expected);

        const result = await controller.createTreatmentSession(dto);

        expect(service.createTreatmentSession).toHaveBeenCalledWith(dto);
        expect(result).toEqual(expected);
      });
    });

    describe('getTreatmentSessionsByPatient', () => {
      it('should get treatment sessions by patient', async () => {
        const patientId = 1;
        const expected: TreatmentSessionResponseDto[] = [
          {
            id: 1,
            treatment_record_id: 1,
            attendance_id: 1,
            patient_id: 1,
            treatment_type: 'light_bath' as any,
            body_location: 'head',
            start_date: new Date('2024-01-01'),
            planned_sessions: 10,
            completed_sessions: 5,
            end_date: null,
            status: 'scheduled',
            duration_minutes: 30,
            color: 'blue',
            notes: 'Test treatment',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        mockTreatmentSessionService.getTreatmentSessionsByPatient.mockResolvedValue(expected);

        const result = await controller.getTreatmentSessionsByPatient(patientId);

        expect(service.getTreatmentSessionsByPatient).toHaveBeenCalledWith(patientId);
        expect(result).toEqual(expected);
      });
    });

    describe('getTreatmentSessionById', () => {
      it('should get treatment session by ID', async () => {
        const sessionId = 1;
        const expected: TreatmentSessionResponseDto = {
          id: 1,
          treatment_record_id: 1,
          attendance_id: 1,
          patient_id: 1,
          treatment_type: 'light_bath' as any,
          body_location: 'head',
          start_date: new Date('2024-01-01'),
          planned_sessions: 10,
          completed_sessions: 5,
          end_date: null,
          status: 'scheduled',
          duration_minutes: 30,
          color: 'blue',
          notes: 'Test treatment',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionService.getTreatmentSessionById.mockResolvedValue(expected);

        const result = await controller.getTreatmentSessionById(sessionId);

        expect(service.getTreatmentSessionById).toHaveBeenCalledWith(sessionId);
        expect(result).toEqual(expected);
      });
    });

    describe('updateTreatmentSession', () => {
      it('should update a treatment session', async () => {
        const sessionId = 1;
        const dto: UpdateTreatmentSessionDto = {
          notes: 'Updated notes',
        };

        const expected: TreatmentSessionResponseDto = {
          id: 1,
          treatment_record_id: 1,
          attendance_id: 1,
          patient_id: 1,
          treatment_type: 'light_bath' as any,
          body_location: 'head',
          start_date: new Date('2024-01-01'),
          planned_sessions: 10,
          completed_sessions: 5,
          end_date: null,
          status: 'scheduled',
          duration_minutes: 45,
          color: 'blue',
          notes: 'Updated notes',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockTreatmentSessionService.updateTreatmentSession.mockResolvedValue(expected);

        const result = await controller.updateTreatmentSession(sessionId, dto);

        expect(service.updateTreatmentSession).toHaveBeenCalledWith(sessionId, dto);
        expect(result).toEqual(expected);
      });
    });

    describe('deleteTreatmentSession', () => {
      it('should delete a treatment session', async () => {
        const sessionId = 1;

        mockTreatmentSessionService.deleteTreatmentSession.mockResolvedValue(undefined);

        await controller.deleteTreatmentSession(sessionId);

        expect(service.deleteTreatmentSession).toHaveBeenCalledWith(sessionId);
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('getTreatmentStats', () => {
      it('should get treatment statistics', async () => {
        const patientId = 1;
        const expected = {
          totalSessions: 20,
          completedSessions: 15,
          missedSessions: 2,
          scheduledSessions: 3,
          completionRate: 75,
        };

        mockTreatmentSessionService.getTreatmentStats.mockResolvedValue(expected);

        const result = await controller.getTreatmentStats(patientId);

        expect(service.getTreatmentStats).toHaveBeenCalledWith(patientId);
        expect(result).toEqual(expected);
      });
    });
  });
});