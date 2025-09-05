import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { CreateAttendanceDto } from '../dtos/attendance.dto';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { Repository, DeleteResult } from 'typeorm';
import {
  ResourceNotFoundException,
  InvalidAttendanceStatusTransitionException,
  AttendanceTimeSlotUnavailableException,
} from '../common/exceptions';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repository: Repository<Attendance>;
  let module: TestingModule;

  const mockAttendance = {
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
  } as Attendance;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(), // Add missing addOrderBy method
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        patient_name: 'John Doe',
        scheduled_date: '2025-07-22',
        scheduled_time: '14:00:00',
        status: 'scheduled',
        type: 'spiritual',
      },
    ]),
    getOne: jest.fn().mockResolvedValue({
      scheduled_date: new Date('2025-07-23'),
    }),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 3 }),
  };

  const mockRepository = {
    save: jest.fn().mockResolvedValue(mockAttendance), // Fix save to return the attendance
    find: jest.fn().mockResolvedValue([mockAttendance]),
    findOne: jest.fn().mockResolvedValue(mockAttendance),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    merge: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockReturnValue(mockAttendance),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ScheduleSetting),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ max_daily_attendances: 10 }),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const result = await service.create(createDto);

      expect(result).toMatchObject({
        id: expect.any(Number),
        patient_id: createDto.patient_id,
        type: createDto.type,
        scheduled_date: expect.any(Date), // Expect Date object since mockAttendance has a Date
        scheduled_time: createDto.scheduled_time,
        notes: createDto.notes,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of attendances', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockAttendance]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attendance', async () => {
      const result = await service.findOne(1);

      expect(result).toEqual(mockAttendance);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['patient'],
      });
    });
  });

  describe('update', () => {
    it('should update an attendance', async () => {
      const updateDto = { notes: 'Updated notes' };

      await service.update(1, updateDto);

      expect(repository.merge).toHaveBeenCalledWith(mockAttendance, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['patient'],
      });
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('validateScheduling', () => {
    let scheduleSettingRepository: Repository<ScheduleSetting>;

    beforeEach(() => {
      scheduleSettingRepository = module.get<Repository<ScheduleSetting>>(
        getRepositoryToken(ScheduleSetting),
      );
    });

    it('should throw ResourceNotFoundException when no scheduling settings available', async () => {
      jest
        .spyOn(scheduleSettingRepository, 'findOne')
        .mockResolvedValueOnce(null);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('should throw AttendanceTimeSlotUnavailableException when time is outside operational hours', async () => {
      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '12:00',
        max_concurrent_spiritual: 2,
        max_concurrent_light_bath: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as ScheduleSetting);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(
        AttendanceTimeSlotUnavailableException,
      );
    });

    it('should throw AttendanceTimeSlotUnavailableException when maximum concurrent appointments reached', async () => {
      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '17:00',
        max_concurrent_spiritual: 2,
        max_concurrent_light_bath: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as ScheduleSetting);

      jest.spyOn(repository, 'count').mockResolvedValueOnce(2);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(
        AttendanceTimeSlotUnavailableException,
      );
    });
  });

  describe('validateStatusTransition', () => {
    it('should throw InvalidAttendanceStatusTransitionException for invalid status transition', async () => {
      const updateDto = {
        status: AttendanceStatus.COMPLETED,
        notes: 'Updated notes',
      };

      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockScheduledAttendance);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InvalidAttendanceStatusTransitionException,
      );
    });

    it('should allow valid status transition', async () => {
      const updateDto = {
        status: AttendanceStatus.CHECKED_IN,
        notes: 'Updated notes',
      };

      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockScheduledAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockAttendance);

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ResourceNotFoundException when attendance not found for deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.remove(999)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('should throw InvalidAttendanceStatusTransitionException when trying to delete completed attendance', async () => {
      const completedAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.COMPLETED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(completedAttendance);

      await expect(service.remove(1)).rejects.toThrow(
        InvalidAttendanceStatusTransitionException,
      );
    });

    it('should throw ResourceNotFoundException when delete affects no rows', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockAttendance);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);

      await expect(service.remove(1)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update attendance without status change', async () => {
      const updateDto = {
        notes: 'Updated notes only',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockAttendance);

      await service.update(1, updateDto);

      expect(repository.merge).toHaveBeenCalledWith(mockAttendance, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('validateScheduling edge cases', () => {
    it('should handle light bath type when checking concurrent appointments', async () => {
      const scheduleSettingRepository = module.get<Repository<ScheduleSetting>>(
        getRepositoryToken(ScheduleSetting),
      );

      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '17:00',
        max_concurrent_spiritual: 2,
        max_concurrent_light_bath: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as ScheduleSetting);

      jest.spyOn(repository, 'count').mockResolvedValueOnce(1);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.LIGHT_BATH,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(
        AttendanceTimeSlotUnavailableException,
      );
    });

    it('should allow creation when concurrent count is under limit', async () => {
      const scheduleSettingRepository = module.get<Repository<ScheduleSetting>>(
        getRepositoryToken(ScheduleSetting),
      );

      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '17:00',
        max_concurrent_spiritual: 3,
        max_concurrent_light_bath: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as ScheduleSetting);

      jest.spyOn(repository, 'count').mockResolvedValueOnce(1);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('findOne error cases', () => {
    it('should throw ResourceNotFoundException when attendance not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('additional status transition tests', () => {
    it('should allow transition from CHECKED_IN to IN_PROGRESS', async () => {
      const updateDto = {
        status: AttendanceStatus.IN_PROGRESS,
        notes: 'Starting treatment',
      };

      const mockCheckedInAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_IN,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCheckedInAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from IN_PROGRESS to COMPLETED', async () => {
      const updateDto = {
        status: AttendanceStatus.COMPLETED,
        notes: 'Treatment completed successfully',
      };

      const mockInProgressAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.IN_PROGRESS,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockInProgressAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from SCHEDULED to CANCELLED', async () => {
      const updateDto = {
        status: AttendanceStatus.CANCELLED,
        notes: 'Patient cancelled appointment',
      };

      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockScheduledAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from SCHEDULED to MISSED', async () => {
      const updateDto = {
        status: AttendanceStatus.MISSED,
        notes: 'Patient missed appointment',
      };

      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockScheduledAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should reject invalid transition from COMPLETED to SCHEDULED', async () => {
      const updateDto = {
        status: AttendanceStatus.SCHEDULED,
        notes: 'Trying to reschedule completed',
      };

      const mockCompletedAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.COMPLETED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCompletedAttendance);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InvalidAttendanceStatusTransitionException,
      );
    });

    it('should reject invalid transition from CANCELLED to COMPLETED', async () => {
      const updateDto = {
        status: AttendanceStatus.COMPLETED,
        notes: 'Trying to complete cancelled',
      };

      const mockCancelledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CANCELLED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCancelledAttendance);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        InvalidAttendanceStatusTransitionException,
      );
    });

    // Test new bidirectional transitions
    it('should allow transition from CHECKED_IN to COMPLETED (direct completion)', async () => {
      const updateDto = {
        status: AttendanceStatus.COMPLETED,
        notes: 'Direct completion',
      };

      const mockCheckedInAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_IN,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCheckedInAttendance);
      jest.spyOn(repository, 'merge').mockReturnValueOnce(mockCheckedInAttendance);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockCheckedInAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from CHECKED_IN to SCHEDULED (moving back)', async () => {
      const updateDto = {
        status: AttendanceStatus.SCHEDULED,
        notes: 'Moving back to scheduled',
      };

      const mockCheckedInAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_IN,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCheckedInAttendance);
      jest.spyOn(repository, 'merge').mockReturnValueOnce(mockCheckedInAttendance);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockCheckedInAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from COMPLETED to CHECKED_IN (reopening)', async () => {
      const updateDto = {
        status: AttendanceStatus.CHECKED_IN,
        notes: 'Reopening attendance',
      };

      const mockCompletedAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.COMPLETED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCompletedAttendance);
      jest.spyOn(repository, 'merge').mockReturnValueOnce(mockCompletedAttendance);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockCompletedAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should allow transition from CANCELLED to SCHEDULED (rescheduling)', async () => {
      const updateDto = {
        status: AttendanceStatus.SCHEDULED,
        notes: 'Rescheduling cancelled appointment',
      };

      const mockCancelledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CANCELLED,
      } as Attendance;

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockCancelledAttendance);
      jest.spyOn(repository, 'merge').mockReturnValueOnce(mockCancelledAttendance);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockCancelledAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAllForAgenda', () => {
    it('should return raw agenda data without filters', async () => {
      const result = await service.findAllForAgenda();

      expect(result).toEqual([
        {
          id: 1,
          patient_name: 'John Doe',
          scheduled_date: '2025-07-22',
          scheduled_time: '14:00:00',
          status: 'scheduled',
          type: 'spiritual',
        },
      ]);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should apply filters when provided', async () => {
      const filters = {
        status: AttendanceStatus.SCHEDULED,
        type: 'spiritual',
        limit: 5,
      };

      const mockQueryBuilderForFilters = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            patient_name: 'John Doe',
            scheduled_date: '2025-07-22',
            scheduled_time: '14:00:00',
            status: 'scheduled',
            type: 'spiritual',
          },
        ]),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilderForFilters as any);

      const result = await service.findAllForAgenda(filters);

      expect(mockQueryBuilderForFilters.andWhere).toHaveBeenCalledWith(
        'attendance.status = :status',
        { status: AttendanceStatus.SCHEDULED }
      );
      expect(mockQueryBuilderForFilters.andWhere).toHaveBeenCalledWith(
        'attendance.type = :type',
        { type: 'spiritual' }
      );
      expect(mockQueryBuilderForFilters.limit).toHaveBeenCalledWith(5);
    });

    it('should handle empty filters', async () => {
      const filters = {};
      const result = await service.findAllForAgenda(filters);

      expect(result).toBeDefined();
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findNextScheduledDate', () => {
    it('should return next scheduled date as string', async () => {
      const result = await service.findNextScheduledDate();

      expect(result).toBe('2025-07-23');
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return null when no future attendances found', async () => {
      // Create a new mock that returns null
      const mockQueryBuilderForNull = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilderForNull as any);

      const result = await service.findNextScheduledDate();

      expect(result).toBeNull();
    });

    it('should handle date string conversion correctly', async () => {
      const mockQueryBuilderForString = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          scheduled_date: '2025-07-25', // String format
        }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilderForString as any);

      const result = await service.findNextScheduledDate();

      expect(result).toBe('2025-07-25');
    });

    it('should handle errors gracefully', async () => {
      const mockQueryBuilderForError = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilderForError as any);

      await expect(service.findNextScheduledDate()).rejects.toThrow('Database error');
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple attendances with status and timestamp', async () => {
      const ids = [1, 2, 3];
      const status = AttendanceStatus.CHECKED_IN;

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      const result = await service.bulkUpdateStatus(ids, status);

      expect(result).toBe(3);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.update).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AttendanceStatus.CHECKED_IN,
          checked_in_at: expect.any(Date),
          updated_at: expect.any(Date),
        })
      );
      expect(mockUpdateQueryBuilder.where).toHaveBeenCalledWith('id IN (:...ids)', { ids });
    });

    it('should set appropriate timestamp for IN_PROGRESS status', async () => {
      const ids = [1];
      const status = AttendanceStatus.IN_PROGRESS;

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      await service.bulkUpdateStatus(ids, status);

      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AttendanceStatus.IN_PROGRESS,
          started_at: expect.any(Date),
          updated_at: expect.any(Date),
        })
      );
    });

    it('should set appropriate timestamp for COMPLETED status', async () => {
      const ids = [1];
      const status = AttendanceStatus.COMPLETED;

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      await service.bulkUpdateStatus(ids, status);

      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AttendanceStatus.COMPLETED,
          completed_at: expect.any(Date),
          updated_at: expect.any(Date),
        })
      );
    });

    it('should set appropriate timestamp for CANCELLED status', async () => {
      const ids = [1];
      const status = AttendanceStatus.CANCELLED;

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      await service.bulkUpdateStatus(ids, status);

      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AttendanceStatus.CANCELLED,
          cancelled_at: expect.any(Date),
          updated_at: expect.any(Date),
        })
      );
    });

    it('should not set specific timestamp for SCHEDULED status', async () => {
      const ids = [1];
      const status = AttendanceStatus.SCHEDULED;

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      await service.bulkUpdateStatus(ids, status);

      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AttendanceStatus.SCHEDULED,
          updated_at: expect.any(Date),
        })
      );
      
      const setCall = mockUpdateQueryBuilder.set.mock.calls[0][0];
      expect(setCall).not.toHaveProperty('checked_in_at');
      expect(setCall).not.toHaveProperty('started_at');
      expect(setCall).not.toHaveProperty('completed_at');
      expect(setCall).not.toHaveProperty('cancelled_at');
    });

    it('should handle empty ids array', async () => {
      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      const result = await service.bulkUpdateStatus([], AttendanceStatus.CHECKED_IN);

      expect(result).toBe(0);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockUpdateQueryBuilder as any);

      await expect(
        service.bulkUpdateStatus([1, 2], AttendanceStatus.CHECKED_IN)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAttendanceStats', () => {
    const mockAttendances = [
      {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
        type: 'spiritual',
      },
      {
        ...mockAttendance,
        id: 2,
        status: AttendanceStatus.CHECKED_IN,
        type: 'spiritual',
      },
      {
        ...mockAttendance,
        id: 3,
        status: AttendanceStatus.COMPLETED,
        type: 'light_bath',
      },
    ];

    it('should return attendance statistics for a date', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce(mockAttendances as any);

      const result = await service.getAttendanceStats('2025-07-22');

      expect(result).toEqual({
        total: 3,
        scheduled: 1,
        checked_in: 1,
        in_progress: 0,
        completed: 1,
        cancelled: 0,
        by_type: { spiritual: 2, light_bath: 1, rod: 0 },
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { scheduled_date: new Date('2025-07-22') },
      });
    });

    it('should return empty stats when no attendances found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      const result = await service.getAttendanceStats('2025-12-25');

      expect(result).toEqual({
        total: 0,
        scheduled: 0,
        checked_in: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        by_type: { spiritual: 0, light_bath: 0, rod: 0 },
      });
    });

    it('should handle all attendance statuses correctly', async () => {
      const allStatusAttendances = [
        { ...mockAttendance, status: AttendanceStatus.SCHEDULED, type: 'spiritual' },
        { ...mockAttendance, status: AttendanceStatus.CHECKED_IN, type: 'spiritual' },
        { ...mockAttendance, status: AttendanceStatus.IN_PROGRESS, type: 'light_bath' },
        { ...mockAttendance, status: AttendanceStatus.COMPLETED, type: 'light_bath' },
        { ...mockAttendance, status: AttendanceStatus.CANCELLED, type: 'spiritual' },
      ];

      jest.spyOn(repository, 'find').mockResolvedValueOnce(allStatusAttendances as any);

      const result = await service.getAttendanceStats('2025-07-22');

      expect(result).toEqual({
        total: 5,
        scheduled: 1,
        checked_in: 1,
        in_progress: 1,
        completed: 1,
        cancelled: 1,
        by_type: { spiritual: 3, light_bath: 2, rod: 0 },
      });
    });

    it('should convert date string to Date object', async () => {
      jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

      await service.getAttendanceStats('2025-07-22');

      expect(repository.find).toHaveBeenCalledWith({
        where: { scheduled_date: new Date('2025-07-22') },
      });
    });
  });
});
