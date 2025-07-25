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

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => ({
      ...dto,
      status: AttendanceStatus.SCHEDULED,
    })),
    save: jest
      .fn()
      .mockImplementation((attendance) =>
        Promise.resolve({ id: 1, ...attendance }),
      ),
    find: jest.fn().mockResolvedValue([mockAttendance]),
    findOne: jest.fn().mockResolvedValue(mockAttendance),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(0),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
    remove: jest.fn().mockResolvedValue(true),
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
        ...createDto,
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

    it('should reject transition from COMPLETED to any other status', async () => {
      const updateDto = {
        status: AttendanceStatus.CANCELLED,
        notes: 'Trying to cancel completed',
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

    it('should reject transition from CANCELLED to any other status', async () => {
      const updateDto = {
        status: AttendanceStatus.SCHEDULED,
        notes: 'Trying to reschedule cancelled',
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
  });
});
