import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { CreateAttendanceDto } from '../dtos/attendance.dto';
import { AttendanceType, AttendanceStatus } from '../common/enums';
import { ScheduleSetting } from '../entities/schedule-setting.entity';
import { Repository, DeleteResult } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
    cancelled_at: null
  } as Attendance;

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => ({ ...dto, status: AttendanceStatus.SCHEDULED })),
    save: jest.fn().mockImplementation(attendance => Promise.resolve({ id: 1, ...attendance })),
    find: jest.fn().mockResolvedValue([mockAttendance]),
    findOne: jest.fn().mockResolvedValue(mockAttendance),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(0),
    merge: jest.fn().mockImplementation((obj, dto) => ({ ...obj, ...dto })),
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
    repository = module.get<Repository<Attendance>>(getRepositoryToken(Attendance));
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
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['patient'] });
    });
  });

  describe('update', () => {
    it('should update an attendance', async () => {
      const updateDto = { notes: 'Updated notes' };
      
      await service.update(1, updateDto);
      
      expect(repository.merge).toHaveBeenCalledWith(mockAttendance, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['patient'] });
    });
  });

  describe('remove', () => {
    it('should remove an attendance', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when attendance not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0, raw: {} } as DeleteResult);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateScheduling', () => {
    let scheduleSettingRepository: Repository<ScheduleSetting>;

    beforeEach(() => {
      scheduleSettingRepository = module.get<Repository<ScheduleSetting>>(getRepositoryToken(ScheduleSetting));
    });

    it('should throw BadRequestException when no scheduling settings available', async () => {
      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce(null);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when time is outside operational hours', async () => {
      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '12:00',
        max_concurrent_spiritual: 2,
        max_concurrent_light_bath: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      } as ScheduleSetting);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when maximum concurrent appointments reached', async () => {
      jest.spyOn(scheduleSettingRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        day_of_week: 2,
        start_time: '09:00',
        end_time: '17:00',
        max_concurrent_spiritual: 2,
        max_concurrent_light_bath: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      } as ScheduleSetting);
      
      jest.spyOn(repository, 'count').mockResolvedValueOnce(2);

      const dto: CreateAttendanceDto = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2025-07-22',
        scheduled_time: '14:30',
        notes: 'Test notes',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateStatusTransition', () => {
    it('should throw BadRequestException for invalid status transition', async () => {
      const updateDto = { 
        status: AttendanceStatus.COMPLETED,
        notes: 'Updated notes' 
      };
      
      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED
      } as Attendance;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockScheduledAttendance);

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transition', async () => {
      const updateDto = { 
        status: AttendanceStatus.CHECKED_IN,
        notes: 'Updated notes' 
      };
      
      const mockScheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED
      } as Attendance;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockScheduledAttendance);

      await service.update(1, updateDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findOne error cases', () => {
    it('should throw NotFoundException when attendance not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
