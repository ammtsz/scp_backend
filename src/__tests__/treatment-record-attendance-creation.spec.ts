import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreatmentRecordService } from '../services/treatment-record.service';
import { TreatmentRecord } from '../entities/treatment-record.entity';
import { Attendance } from '../entities/attendance.entity';
import { TreatmentSessionService } from '../services/treatment-session.service';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceType } from '../common/enums';

describe('TreatmentRecordService - Attendance Creation', () => {
  let service: TreatmentRecordService;
  let attendanceService: AttendanceService;
  let treatmentRecordRepository: Repository<TreatmentRecord>;
  let attendanceRepository: Repository<Attendance>;

  const mockTreatmentSessionService = {
    createTreatmentSession: jest.fn(),
  };

  const mockAttendanceService = {
    create: jest.fn(),
  };

  const mockTreatmentRecordRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAttendanceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentRecordService,
        {
          provide: getRepositoryToken(TreatmentRecord),
          useValue: mockTreatmentRecordRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
        {
          provide: TreatmentSessionService,
          useValue: mockTreatmentSessionService,
        },
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    service = module.get<TreatmentRecordService>(TreatmentRecordService);
    attendanceService = module.get<AttendanceService>(AttendanceService);
    treatmentRecordRepository = module.get<Repository<TreatmentRecord>>(
      getRepositoryToken(TreatmentRecord),
    );
    attendanceRepository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  describe('createAttendancesForTreatmentSessions', () => {
    it('should create multiple attendances for multiple sessions', async () => {
      // Setup
      const patientId = 1;
      const attendanceType = AttendanceType.LIGHT_BATH;
      const startDate = new Date('2024-01-15'); // Monday
      const sessionCount = 4; // 4 sessions
      const notes = 'Test Light Bath Treatment';

      // Mock successful attendance creation
      mockAttendanceService.create.mockResolvedValue({ id: 1 });

      // Call the private method via reflection (for testing purposes)
      const createAttendancesMethod = service['createAttendancesForTreatmentSessions'].bind(service);
      const result = await createAttendancesMethod(
        patientId,
        attendanceType,
        startDate,
        sessionCount,
        notes,
      );

      // Verify attendance service was called 4 times (once per session)
      expect(mockAttendanceService.create).toHaveBeenCalledTimes(4);

      // Verify the calls were made with correct parameters
      const calls = mockAttendanceService.create.mock.calls;
      
      // First call - should be next Tuesday after start date (January 16, 2024 is Tuesday, but method calculates next Tuesday)
      expect(calls[0][0]).toEqual({
        patient_id: patientId,
        type: attendanceType,
        scheduled_date: '2024-01-16', // Next Tuesday (Monday 15 -> Tuesday 16)
        scheduled_time: '21:00', // 9 PM default time
        notes: `${notes} - Sessão 1 de 4`,
      });

      // Second call - should be one week later (January 23, 2024)
      expect(calls[1][0]).toEqual({
        patient_id: patientId,
        type: attendanceType,
        scheduled_date: '2024-01-23', // Following Tuesday
        scheduled_time: '21:00',
        notes: `${notes} - Sessão 2 de 4`,
      });

      // Third call - should be another week later (January 30, 2024)
      expect(calls[2][0]).toEqual({
        patient_id: patientId,
        type: attendanceType,
        scheduled_date: '2024-01-30',
        scheduled_time: '21:00',
        notes: `${notes} - Sessão 3 de 4`,
      });

      // Fourth call - should be another week later (February 6, 2024)
      expect(calls[3][0]).toEqual({
        patient_id: patientId,
        type: attendanceType,
        scheduled_date: '2024-02-06',
        scheduled_time: '21:00',
        notes: `${notes} - Sessão 4 de 4`,
      });

      // Verify result
      expect(result.success).toBe(4);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial failures correctly', async () => {
      // Setup
      const patientId = 1;
      const attendanceType = AttendanceType.ROD;
      const startDate = new Date('2024-01-17'); // Wednesday
      const sessionCount = 3;
      const notes = 'Test Rod Treatment';

      // Mock partial failure - first and third succeed, second fails
      mockAttendanceService.create
        .mockResolvedValueOnce({ id: 1 }) // First succeeds
        .mockRejectedValueOnce(new Error('Scheduling conflict')) // Second fails
        .mockResolvedValueOnce({ id: 3 }); // Third succeeds

      const createAttendancesMethod = service['createAttendancesForTreatmentSessions'].bind(service);
      const result = await createAttendancesMethod(
        patientId,
        attendanceType,
        startDate,
        sessionCount,
        notes,
      );

      // Verify all 3 attempts were made
      expect(mockAttendanceService.create).toHaveBeenCalledTimes(3);

      // Verify result shows partial success
      expect(result.success).toBe(2); // 2 successful
      expect(result.errors).toHaveLength(1); // 1 error
      expect(result.errors[0]).toContain('Erro ao criar agendamento 2/3');
      expect(result.errors[0]).toContain('Scheduling conflict');
    });

    it('should schedule on Tuesdays only', async () => {
      // Test various start dates to ensure they all schedule on Tuesdays
      const testCases = [
        { startDate: new Date('2024-01-15'), expectedFirstTuesday: '2024-01-16' }, // Monday -> Tuesday
        { startDate: new Date('2024-01-16'), expectedFirstTuesday: '2024-01-16' }, // Tuesday -> Same Tuesday
        { startDate: new Date('2024-01-17'), expectedFirstTuesday: '2024-01-23' }, // Wednesday -> Next Tuesday
        { startDate: new Date('2024-01-21'), expectedFirstTuesday: '2024-01-23' }, // Sunday -> Next Tuesday
      ];

      for (const testCase of testCases) {
        // Reset mock
        mockAttendanceService.create.mockClear();
        mockAttendanceService.create.mockResolvedValue({ id: 1 });

        const createAttendancesMethod = service['createAttendancesForTreatmentSessions'].bind(service);
        await createAttendancesMethod(
          1,
          AttendanceType.LIGHT_BATH,
          testCase.startDate,
          1,
          'Test',
        );

        const firstCall = mockAttendanceService.create.mock.calls[0][0];
        expect(firstCall.scheduled_date).toBe(testCase.expectedFirstTuesday);
      }
    });

    it('should use 21:00 as default time for all sessions', async () => {
      mockAttendanceService.create.mockResolvedValue({ id: 1 });

      const createAttendancesMethod = service['createAttendancesForTreatmentSessions'].bind(service);
      await createAttendancesMethod(
        1,
        AttendanceType.LIGHT_BATH,
        new Date('2024-01-15'),
        3,
        'Test Treatment',
      );

      // Verify all calls use 21:00 time
      const calls = mockAttendanceService.create.mock.calls;
      calls.forEach(call => {
        expect(call[0].scheduled_time).toBe('21:00');
      });
    });
  });

  describe('Integration with treatment sessions', () => {
    it('should create attendances when treatment session is created', async () => {
      // Setup mocks for a complete treatment record creation flow
      const mockAttendance = {
        id: 1,
        patient_id: 1,
        status: 'completed',
      };

      const mockTreatmentRecord = {
        id: 1,
        attendance_id: 1,
        light_bath: true,
        quantity: 4, // 4 sessions
        light_bath_color: 'azul',
      };

      mockAttendanceRepository.findOne.mockResolvedValue(mockAttendance);
      mockTreatmentSessionService.createTreatmentSession.mockResolvedValue({
        id: 1,
        planned_sessions: 4,
      });
      mockAttendanceService.create.mockResolvedValue({ id: 1 });

      // Call the light bath session creation method
      const createLightBathMethod = service['createLightBathSession'].bind(service);
      const result = await createLightBathMethod(mockTreatmentRecord, mockAttendance);

      // Verify treatment session was created
      expect(mockTreatmentSessionService.createTreatmentSession).toHaveBeenCalledTimes(1);

      // Verify attendances were created (4 times for 4 sessions)
      expect(mockAttendanceService.create).toHaveBeenCalledTimes(4);

      // Verify result indicates success
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
