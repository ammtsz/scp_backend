import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from '../services/attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from '../dtos/attendance.dto';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { ResourceNotFoundException } from '../common/exceptions';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let service: AttendanceService;

  const mockAttendance = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: '2025-07-22',
    scheduled_time: '14:30',
    checked_in_at: undefined,
    started_at: undefined,
    completed_at: undefined,
    cancelled_at: undefined,
    notes: 'Test notes',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAttendanceService = {
    create: jest.fn((dto) => 
      Promise.resolve({
        id: 1,
        ...dto,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    ),
    findAll: jest.fn(() => Promise.resolve([mockAttendance])),
    findAllForAgenda: jest.fn(() => 
      Promise.resolve([
        {
          attendance_id: 1,
          attendance_patient_id: 1,
          attendance_type: 'spiritual',
          attendance_status: 'scheduled',
          attendance_scheduled_date: '2025-07-22',
          attendance_notes: 'Test notes',
          patient_name: 'John Doe',
          patient_priority: '2',
        },
      ])
    ),
    findNextScheduledDate: jest.fn(() => Promise.resolve('2025-07-23')),
    bulkUpdateStatus: jest.fn(() => Promise.resolve(3)),
    getAttendanceStats: jest.fn(() => 
      Promise.resolve({
        total: 5,
        scheduled: 2,
        checked_in: 1,
        in_progress: 1,
        completed: 1,
        cancelled: 0,
        by_type: { spiritual: 3, light_bath: 2 },
      })
    ),
    findOne: jest.fn(() =>
      Promise.resolve({
        id: 1,
        patient_id: 1,
        patient: null,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: new Date('2025-07-22'),
        scheduled_time: '14:30',
        notes: 'Test notes',
        created_at: new Date(),
        updated_at: new Date(),
        checked_in_at: null,
        started_at: null,
        completed_at: null,
        cancelled_at: null,
      }),
    ),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn(() => Promise.resolve(undefined)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new attendance', async () => {
      const createDto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      const result = await controller.create(createDto);

      expect(result).toMatchObject({
        id: expect.any(Number),
        ...createDto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attendances', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockAttendance]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attendance', async () => {
      const result = await controller.findOne('1');

      expect(result).toMatchObject({
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_time: '14:30',
        notes: 'Test notes',
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an attendance', async () => {
      const updateDto: UpdateAttendanceDto = {
        notes: 'Updated notes',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toMatchObject({
        id: 1,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw ResourceNotFoundException when attendance not found for update', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(null);

      const updateDto: UpdateAttendanceDto = {
        notes: 'Updated notes',
      };

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual(undefined);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found for deletion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(controller.remove('999')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('findAllForAgenda', () => {
    it('should return agenda attendances without filters', async () => {
      const result = await controller.findAllForAgenda();

      expect(result).toEqual([
        {
          id: 1,
          patient_id: 1,
          type: 'spiritual',
          status: 'scheduled',
          scheduled_date: '2025-07-22',
          notes: 'Test notes',
          patient_name: 'John Doe',
          patient_priority: '2',
        },
      ]);
      expect(service.findAllForAgenda).toHaveBeenCalledWith({
        status: undefined,
        type: undefined,
        limit: undefined,
      });
    });

    it('should return agenda attendances with filters', async () => {
      const result = await controller.findAllForAgenda('scheduled', 'spiritual', '10');

      expect(result).toEqual([
        {
          id: 1,
          patient_id: 1,
          type: 'spiritual',
          status: 'scheduled',
          scheduled_date: '2025-07-22',
          notes: 'Test notes',
          patient_name: 'John Doe',
          patient_priority: '2',
        },
      ]);
      expect(service.findAllForAgenda).toHaveBeenCalledWith({
        status: 'scheduled',
        type: 'spiritual',
        limit: 10,
      });
    });

    it('should handle invalid limit parameter gracefully', async () => {
      const result = await controller.findAllForAgenda(undefined, undefined, 'invalid');

      expect(service.findAllForAgenda).toHaveBeenCalledWith({
        status: undefined,
        type: undefined,
        limit: NaN,
      });
    });
  });

  describe('getNextScheduledDate', () => {
    it('should return next scheduled date', async () => {
      const result = await controller.getNextScheduledDate();

      expect(result).toEqual({
        next_date: '2025-07-23',
      });
      expect(service.findNextScheduledDate).toHaveBeenCalled();
    });

    it('should handle null response from service', async () => {
      jest.spyOn(service, 'findNextScheduledDate').mockResolvedValueOnce(null);

      const result = await controller.getNextScheduledDate();

      expect(result).toEqual({
        next_date: expect.any(String), // Should fallback to today's date
      });
    });

    it('should handle service errors properly', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(service, 'findNextScheduledDate').mockRejectedValueOnce(error);

      await expect(controller.getNextScheduledDate()).rejects.toThrow(error);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should bulk update attendance statuses', async () => {
      const bulkUpdateDto = {
        ids: [1, 2, 3],
        status: 'checked_in',
      };

      const result = await controller.bulkUpdateStatus(bulkUpdateDto);

      expect(result).toEqual({
        updated: 3,
        success: true,
      });
      expect(service.bulkUpdateStatus).toHaveBeenCalledWith(
        [1, 2, 3],
        'checked_in',
      );
    });

    it('should handle empty ids array', async () => {
      const bulkUpdateDto = {
        ids: [],
        status: 'checked_in',
      };
      
      jest.spyOn(service, 'bulkUpdateStatus').mockResolvedValueOnce(0);

      const result = await controller.bulkUpdateStatus(bulkUpdateDto);

      expect(result).toEqual({
        updated: 0,
        success: true,
      });
      expect(service.bulkUpdateStatus).toHaveBeenCalledWith([], 'checked_in');
    });

    it('should handle bulk update errors', async () => {
      const bulkUpdateDto = {
        ids: [1, 2, 3],
        status: 'invalid_status',
      };
      
      const error = new Error('Invalid status');
      jest.spyOn(service, 'bulkUpdateStatus').mockRejectedValueOnce(error);

      await expect(controller.bulkUpdateStatus(bulkUpdateDto)).rejects.toThrow(error);
    });

    it('should handle partial updates', async () => {
      const bulkUpdateDto = {
        ids: [1, 2, 999], // 999 doesn't exist
        status: 'completed',
      };
      
      jest.spyOn(service, 'bulkUpdateStatus').mockResolvedValueOnce(2); // Only 2 updated

      const result = await controller.bulkUpdateStatus(bulkUpdateDto);

      expect(result).toEqual({
        updated: 2,
        success: true,
      });
    });
  });

  describe('getAttendanceStats', () => {
    it('should return attendance statistics for default date (today)', async () => {
      const result = await controller.getAttendanceStats();

      expect(result).toEqual({
        total: 5,
        scheduled: 2,
        checked_in: 1,
        in_progress: 1,
        completed: 1,
        cancelled: 0,
        by_type: { spiritual: 3, light_bath: 2 },
      });
      expect(service.getAttendanceStats).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // Today's date in YYYY-MM-DD format
      );
    });

    it('should return attendance statistics for specific date', async () => {
      const testDate = '2025-07-22';
      const result = await controller.getAttendanceStats(testDate);

      expect(result).toEqual({
        total: 5,
        scheduled: 2,
        checked_in: 1,
        in_progress: 1,
        completed: 1,
        cancelled: 0,
        by_type: { spiritual: 3, light_bath: 2 },
      });
      expect(service.getAttendanceStats).toHaveBeenCalledWith(testDate);
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        total: 0,
        scheduled: 0,
        checked_in: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        by_type: { spiritual: 0, light_bath: 0 },
      };
      
      jest.spyOn(service, 'getAttendanceStats').mockResolvedValueOnce(emptyStats);

      const result = await controller.getAttendanceStats('2025-12-25');

      expect(result).toEqual(emptyStats);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'getAttendanceStats').mockRejectedValueOnce(error);

      await expect(controller.getAttendanceStats('2025-07-22')).rejects.toThrow(error);
    });
  });
});
